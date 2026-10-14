from typing import List, Dict, Tuple, Optional, Set
from collections import Counter, defaultdict, deque
import numpy as np
import pandas as pd


REGRESSION_FEATURES = [
    "recency",
    "frequency",
    "recent_frequency",
    "recent_frequency_ratio",
    "avg_reuse_distance",
    "reuse_distance_std",
    "lifetime",
    "recent_working_set_size"
]


def extract_block_features(
    candidate: str,
    current_index: int,
    last_access: Dict[str, int],
    first_access: Dict[str, int],
    frequency: Counter,
    reuse_intervals: Dict[str, List[int]],
    recent_counter: Counter
) -> Dict[str, float]:
    """
    Extracts the 8 temporal features for a single candidate block.
    Matches Cell 28 and Cell 54 of AIML_PBL_Replacement_Model.ipynb exactly.
    """
    # Handles blocks that were prefetched but never accessed by the CPU yet
    if candidate not in last_access:
        return {
            "recency": 0.0,
            "frequency": 0.0,
            "recent_frequency": 0.0,
            "recent_frequency_ratio": 0.0,
            "avg_reuse_distance": 0.0,
            "reuse_distance_std": 0.0,
            "lifetime": 0.0,
            "recent_working_set_size": float(len(recent_counter))
        }

    recency = float(current_index - last_access[candidate])
    freq = float(frequency[candidate])
    recent_freq = float(recent_counter[candidate])
    recent_ratio = float(recent_freq / max(freq, 1.0))

    intervals = reuse_intervals[candidate]
    if intervals:
        avg_reuse_distance = float(np.mean(intervals))
        reuse_std = float(np.std(intervals))
    else:
        avg_reuse_distance = recency
        reuse_std = 0.0

    lifetime = float(current_index - first_access[candidate])
    recent_working_set_size = float(len(recent_counter))

    return {
        "recency": recency,
        "frequency": freq,
        "recent_frequency": recent_freq,
        "recent_frequency_ratio": recent_ratio,
        "avg_reuse_distance": avg_reuse_distance,
        "reuse_distance_std": reuse_std,
        "lifetime": lifetime,
        "recent_working_set_size": recent_working_set_size
    }


def predict_next_use_distances(
    candidates: List[str],
    current_index: int,
    model,
    last_access: Dict[str, int],
    first_access: Dict[str, int],
    frequency: Counter,
    reuse_intervals: Dict[str, List[int]],
    recent_counter: Counter,
    feature_names: Optional[List[str]] = None
) -> Tuple[Optional[str], Dict[str, float]]:
    """
    Scores all candidate blocks with the RandomForestRegressor model
    and selects the victim with the largest predicted next-use distance.
    Matches Cell 28 and Cell 60 of AIML_PBL_Replacement_Model.ipynb.
    """
    if not candidates:
        return None, {}

    cols = feature_names if feature_names is not None else REGRESSION_FEATURES

    feature_rows = [
        extract_block_features(
            candidate=block,
            current_index=current_index,
            last_access=last_access,
            first_access=first_access,
            frequency=frequency,
            reuse_intervals=reuse_intervals,
            recent_counter=recent_counter
        )
        for block in candidates
    ]

    feature_df = pd.DataFrame(feature_rows)[cols]
    predicted_distances = model.predict(feature_df)

    scores = {
        block: round(float(dist), 2)
        for block, dist in zip(candidates, predicted_distances)
    }

    victim_idx = int(np.argmax(predicted_distances))
    victim = candidates[victim_idx]

    return victim, scores
