import * as Dialog from "@radix-ui/react-dialog";
import { useState } from "react";
import { ArrowLeft, X } from "lucide-react";
import HeaderPreviewTable from "./components/HeaderPreviewTable";
import HeaderSettingsForm from "./components/HeaderSettingsForm";
import {
  DEFAULT_HEADER_SETTINGS,
  HEADER_FIELDS,
  saveHeaderSettings,
  getStoredHeaderSettings,
} from "./uploadHelpers";

const ManageHeadersModal = ({ open, onOpenChange }) => {
  const [settings, setSettings] = useState(() => getStoredHeaderSettings());
  const [activeFieldKey, setActiveFieldKey] = useState(HEADER_FIELDS[0].key);

  const handleOpenChange = (nextOpen) => {
    if (nextOpen) {
      setSettings(getStoredHeaderSettings());
      setActiveFieldKey(HEADER_FIELDS[0].key);
    }

    onOpenChange(nextOpen);
  };

  const updateField = (fieldKey, value) => {
    setSettings((currentSettings) => ({
      ...currentSettings,
      [fieldKey]: value,
    }));
  };

  const handleSave = (event) => {
    event?.preventDefault?.();

    const nextSettings = HEADER_FIELDS.reduce((accumulator, field) => {
      accumulator[field.key] =
        settings[field.key]?.trim() || DEFAULT_HEADER_SETTINGS[field.key];
      return accumulator;
    }, {});

    saveHeaderSettings(nextSettings);
    setSettings(nextSettings);
    onOpenChange(false);
  };

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/35 backdrop-blur-[3px]" />

        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[min(1160px,95vw)] -translate-x-1/2 -translate-y-1/2 h-[90vh] overflow-hidden rounded-2xl bg-brand-sky p-3 focus:outline-none">
          <Dialog.Title className="sr-only">Manage Your Headers</Dialog.Title>
          <Dialog.Description className="sr-only">
            Seed the header form with common aliases, then save the exact spreadsheet headers used for V2 raw-lead uploads.
          </Dialog.Description>

          <Dialog.Close className="absolute right-8 top-8 z-10 inline-flex h-11 w-11 items-center justify-center rounded-full bg-brand-white text-brand-blackish">
            <X size={18} />
          </Dialog.Close>

          <div className="grid h-full gap-4 lg:grid-cols-[1fr_1.06fr]">
            <section className="flex h-full flex-col overflow-hidden ">
              <div className="flex-shrink-0 px-7 pt-7">
                <button
                  type="button"
                  onClick={() => onOpenChange(false)}
                  className="inline-flex items-center gap-2 text-sm font-medium text-brand-blackish"
                >
                  <ArrowLeft size={15} />
                  Back
                </button>
              </div>

              <div className="mt-4 flex-1 min-h-0 overflow-y-auto px-7 pb-7 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                <HeaderSettingsForm
                  settings={settings}
                  activeFieldKey={activeFieldKey}
                  onFocusField={setActiveFieldKey}
                  onChangeField={updateField}
                  onSubmit={handleSave}
                />
              </div>
            </section>

            <HeaderPreviewTable
              settings={settings}
              activeFieldKey={activeFieldKey}
            />
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default ManageHeadersModal;
