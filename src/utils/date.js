function getLeagueStatus(start, end) {
    const today = new Date();
    const startDate = new Date(start);
    const endDate = new Date(end);

    if (today < startDate) {
        return "Upcoming";
    }

    if (today > endDate) {
        return "Finished";
    }

    return "Ongoing";
}

function formatDate(date) {
    return new Date(date).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
}

export { getLeagueStatus, formatDate };