import { HEADER_FIELDS } from "../uploadHelpers";

const HeaderSettingsForm = ({
  settings,
  activeFieldKey,
  onFocusField,
  onChangeField,
  onSubmit,
}) => (
  <form onSubmit={onSubmit} className="flex h-full flex-col">
    <div>
      <h2 className="font-park text-xl font-bold text-brand-blackish">
        Manage Your Headers
      </h2>
      <p className="mt-2 text-sm text-brand-label">
        Start from the seeded aliases below, then save the exact header names your spreadsheet uses
      </p>
    </div>

    <div className="mt-8 grid gap-x-6 gap-y-7 md:grid-cols-2">
      {HEADER_FIELDS.map((field) => {
        const isActive = activeFieldKey === field.key;

        return (
          <label key={field.key} className="block">
            <span className="block font-semibold text-brand-blackish">
              {field.label}
            </span>
            <input
              type="text"
              value={settings[field.key] || ""}
              placeholder={field.placeholder}
              onFocus={() => onFocusField(field.key)}
              onChange={(event) => onChangeField(field.key, event.target.value)}
              className={`mt-3 w-full rounded-xl border bg-brand-white px-4 py-2 text-brand-blackish outline-none transition ${
                isActive ? "border-brand-blackish" : "border-brand-stroke"
              }`}
            />
          </label>
        );
      })}
    </div>

    <button
      type="submit"
      className="mt-8 w-full max-w-[280px] rounded-[1rem] bg-brand-blackish px-6 py-3 font-park text-lg font-semibold text-brand-white transition hover:opacity-95"
    >
      Update Header
    </button>
  </form>
);

export default HeaderSettingsForm;
