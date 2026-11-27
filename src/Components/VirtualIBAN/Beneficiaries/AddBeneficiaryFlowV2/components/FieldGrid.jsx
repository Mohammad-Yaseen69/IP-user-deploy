import { FieldRow, Fields } from "./index";
import DynamicField from "./DynamicField";
import { getFieldDef } from "../vendorFields";

const FieldGrid = ({
  names,
  defs,
  values,
  onChange,
  errors = {},
  disabled = false,
  lockedFields = [],
  countryIso3,
  stateData,
  payers,
  payersLoading,
}) => {
  const hasStateField = names.some((name) => getFieldDef(name, defs).type === "state");
  const rows = [];
  for (let index = 0; index < names.length; index += 2) {
    rows.push(names.slice(index, index + 2));
  }

  return (
    <Fields>
      {rows.map((row) => (
        <FieldRow key={row.join("-")} alignEnd>
          {row.map((name) => (
            <DynamicField
              key={name}
              name={name}
              defs={defs}
              value={values[name]}
              values={values}
              countryIso3={countryIso3}
              stateData={stateData}
              hasStateField={hasStateField}
              siblingNames={names}
              payers={payers}
              payersLoading={payersLoading}
              onChange={(value, patch) => onChange(name, value, patch)}
              error={errors[name]}
              disabled={disabled || lockedFields.includes(name)}
            />
          ))}
        </FieldRow>
      ))}
    </Fields>
  );
};

export default FieldGrid;
