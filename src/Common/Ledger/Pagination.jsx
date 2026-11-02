import { ChevronLeft, ChevronRight } from "lucide-react";
import { Fragment } from "react";
import { useTranslation } from "react-i18next";
import s from "./ledger.module.scss";

const Pagination = ({ page, total, limit, onPage, noun }) => {
  const { t } = useTranslation();
  const pages = Math.ceil(total / limit);
  const numbers = [...new Set([1, page - 1, page, page + 1, pages])]
    .filter((n) => n >= 1 && n <= pages)
    .sort((a, b) => a - b);

  return (
    <div className={s.pager}>
      <p>
        {t("Showing")} {(page - 1) * limit + 1}-{Math.min(page * limit, total)} {t("of")} {total}{" "}
        {noun}
      </p>
      {pages > 1 && (
        <div className={s.pages}>
          <button type="button" disabled={page === 1} onClick={() => onPage(page - 1)}>
            <ChevronLeft size={16} />
          </button>
          {numbers.map((n, i) => (
            <Fragment key={n}>
              {i > 0 && n - numbers[i - 1] > 1 && <span>…</span>}
              <button type="button" className={n === page ? s.on : ""} onClick={() => onPage(n)}>
                {n}
              </button>
            </Fragment>
          ))}
          <button type="button" disabled={page === pages} onClick={() => onPage(page + 1)}>
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
};

export default Pagination;
