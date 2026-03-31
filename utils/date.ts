export const toDateKey = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
};

export const getDateKeyWithOffset = (offsetDays: number) => {
    const next = new Date();
    next.setDate(next.getDate() + offsetDays);
    return toDateKey(next);
};

export const formatDateLabel = (dateKey: string) => {
    const [yearText, monthText, dayText] = dateKey.split("-");
    const year = Number(yearText);
    const month = Number(monthText);
    const day = Number(dayText);

    if (!year || !month || !day) {
        return dateKey;
    }

    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString("fr-FR", {
        weekday: "short",
        day: "2-digit",
        month: "short",
    });
};
