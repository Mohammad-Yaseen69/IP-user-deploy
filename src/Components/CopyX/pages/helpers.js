import { RELEASE_STAGES, STAGE } from "../../../stateMachines/copyTrading";

/* Withdrawal journey: the release stages followed by the payout, used on WEB-10 and WEB-10a/b. */
export const moneyMoves = (t, releaseStages) => [
  ...(releaseStages || RELEASE_STAGES.map((stage) => ({ ...stage, state: STAGE.UPCOMING }))).map(
    (stage) => ({ ...stage, hint: stage.hint && t(stage.hint) }),
  ),
  {
    key: "payout",
    label: "Payout",
    hint: t("Sent to your own account in a later step"),
    state: STAGE.UPCOMING,
  },
];
