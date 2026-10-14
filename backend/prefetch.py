from typing import List, Tuple, Optional, Dict
from collections import defaultdict, Counter


class MarkovPrefetcher:
    """
    Static Markov prefetcher using 2-gram transition knowledge.
    Matches Cell 45 of AIML_PBL_Replacement_Model.ipynb.
    """
    def __init__(
        self,
        transition_model: Dict[Tuple[str, ...], Counter],
        context_size: int = 2,
        threshold: float = 0.70
    ):
        self.transition_model = transition_model
        self.context_size = context_size
        self.threshold = threshold

    def predict(self, history: List[str]) -> Tuple[Optional[str], float]:
        if len(history) < self.context_size:
            return None, 0.0

        context = tuple(history[-self.context_size:])

        if context not in self.transition_model:
            return None, 0.0

        candidates = self.transition_model[context]
        total = sum(candidates.values())

        if total <= 0:
            return None, 0.0

        prediction, count = candidates.most_common(1)[0]
        confidence = count / total

        if confidence >= self.threshold:
            return prediction, float(confidence)

        return None, float(confidence)


class AdaptiveMarkovPrefetcher:
    """
    Adaptive Markov prefetcher with online decay and reinforcement.
    Matches Cell 74 of AIML_PBL_Replacement_Model.ipynb.
    """
    def __init__(
        self,
        base_model: Dict[Tuple[str, ...], Counter],
        context_size: int = 2,
        threshold: float = 0.70,
        decay: float = 0.90
    ):
        self.context_size = context_size
        self.threshold = threshold
        self.decay = decay

        # Deep copy transition knowledge for this simulation run
        self.transition_counts = defaultdict(Counter)
        for context, counter in base_model.items():
            self.transition_counts[context].update(counter)

        self.updates = 0

    def decay_context(self, context: Tuple[str, ...]) -> None:
        if context not in self.transition_counts:
            return

        for block in list(self.transition_counts[context].keys()):
            self.transition_counts[context][block] *= self.decay

            if self.transition_counts[context][block] < 0.01:
                del self.transition_counts[context][block]

    def update(self, context: List[str], next_block: str) -> None:
        context_tuple = tuple(context)
        self.decay_context(context_tuple)
        self.transition_counts[context_tuple][next_block] += 1.0
        self.updates += 1

    def predict(self, history: List[str]) -> Tuple[Optional[str], float]:
        if len(history) < self.context_size:
            return None, 0.0

        context = tuple(history[-self.context_size:])

        if context not in self.transition_counts:
            return None, 0.0

        candidates = self.transition_counts[context]
        total = sum(candidates.values())

        if total <= 0:
            return None, 0.0

        prediction, count = candidates.most_common(1)[0]
        confidence = count / total

        if confidence >= self.threshold:
            return prediction, float(confidence)

        return None, float(confidence)
