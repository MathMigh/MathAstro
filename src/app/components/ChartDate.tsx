import { BirthDate, ChatDateProps } from "@/interfaces/BirthChartInterfaces";
import moment from "moment-timezone";
import { useEffect, useState } from "react";
import { getHourAndMinute } from "../utils/chartUtils";

export const ChartDate = (props: ChatDateProps) => {
  const { chartType, birthChart, label } = props;
  const [date, setDate] = useState<BirthDate | undefined>();

  useEffect(() => {
    if (birthChart === undefined) return;

    if (chartType === "birth" || chartType === "profection") {
      const convertedTime = getHourAndMinute(
        Number.parseFloat(birthChart.birthDate.time)
      );

      const transformedDate: BirthDate = {
        ...birthChart.birthDate,
        time: convertedTime,
      };

      setDate(transformedDate);
    }
    else if (birthChart.timezone) {
      const returnTime = birthChart.returnTime;
      const returnDate = moment.tz(returnTime, birthChart.timezone);
      setDate({
        day: returnDate.date(),
        month: returnDate.month() + 1,
        year: returnDate.year(),
        time: returnDate.format("HH:mm"),
        coordinates: {
          ...birthChart.birthDate.coordinates,
        },
      });
    }
  }, [birthChart]);

  const formatTime = (time: string): string => {
    let [hours, minutes] = time.split(":");
    hours = hours.padStart(2, "0");
    minutes = minutes.padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  const formatLocationLabel = (locationName?: string): string => {
    if (!locationName) return "";

    const parts = locationName
      .split(",")
      .map((part) => part.trim())
      .filter(Boolean);

    if (parts.length <= 1) return parts[0] ?? "";
    return parts.slice(0, 3).join(", ");
  };

  if (date === undefined) return;

  const locationLabel = formatLocationLabel(date.coordinates?.name);

  if (chartType === "profection")
    return <div className="text-[0.9rem] text-center md:text-[1rem] font-bold">
      <p>
        Profecção para o ano {date.year}
      </p>
    </div>
  else return (
    <div className="text-[0.9rem] text-center md:text-[1rem] font-bold">
      <p>
        {label && <label>{label}: </label>}
        {date?.day.toString().padStart(2, "0")}/
        {date?.month.toString().padStart(2, "0")}/{date?.year} -{" "}
        {formatTime(date.time ?? "00:00")}
        {locationLabel && (
          <>
            &nbsp;-&nbsp;
            {locationLabel}
          </>
        )}
      </p>
    </div>
  );
};
