import FileState from "../../../../assets/FileState.svg";
import GsapCounter from "./GsapCounter";


const getStatusText = (progress) => {
  if (progress >= 85) return "Adding to Leads Pool...";
  if (progress >= 60) return "Identifying Duplicates";
  if (progress >= 10) return "Validating Leads...";
  return "Uploading Leads...";
};

const UploadStatusPanel = ({
  progress = 0,
  hasFile = false,
  duplicateCount = 0,
  countryLabel = "",
}) => {
  const safeProgress = Math.max(0, Math.min(Number(progress) || 0, 100));

  return (
    <div className="relative flex min-h-[340px] flex-col overflow-hidden rounded-[1.6rem] bg-brand-lightblue">
      <div
        className="absolute inset-x-0 bottom-0 bg-brand-skyblue border-t-brand-blue transition-all duration-500"
        style={{ height: `${safeProgress}%` }}
      />

      <div className="relative z-[1] flex flex-1 flex-col items-center justify-center px-8 text-center">
        <img
          src={FileState}
          alt=""
          className="h-24 w-24 object-contain drop-shadow-[0_18px_30px_rgba(65,97,189,0.25)]"
        />

        <p className={`mt-6 text-lg ${hasFile ? "font-bold text-brand-blackish" : "text-brand-label"}`}>
          {hasFile ? getStatusText(safeProgress) : "No Leads Uploaded Yet!!!"}
        </p>

      </div>

      <div className="relative z-[1] flex items-end justify-end px-6 pb-4">
        <p className="font-park text-[3.3rem] font-bold leading-none text-brand-blackish">
          <GsapCounter value={safeProgress} />
          <span className="ml-1 text-2xl">%</span>
        </p>
      </div>
    </div>
  );
};

export default UploadStatusPanel;
