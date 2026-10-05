/* Turns a list of step labels into stepper items around the current index. */
export const buildSteps = (labels, currentIndex, metas = {}, t) => labels.map((label, index) => ({
    label,
    state: index < currentIndex ? "done" : index === currentIndex ? "current" : "upcoming",
    meta: index === currentIndex ? metas[index] ?? t("In progress") : metas[index],
}))
