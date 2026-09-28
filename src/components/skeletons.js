export function renderTeamSkeletons(count = 6) {
    return Array.from({ length: count }, () => `
        <article class="skeleton-card skeleton-card--team" aria-hidden="true">
            <div class="skeleton-card__top">
                <span class="skeleton skeleton--text skeleton--short"></span>
                <span class="skeleton skeleton--circle"></span>
            </div>
            <div class="skeleton-card__body">
                <span class="skeleton skeleton--logo"></span>
                <span class="skeleton skeleton--title skeleton--short"></span>
                <span class="skeleton skeleton--text skeleton--short"></span>
            </div>
            <div class="skeleton-card__footer">
                <span class="skeleton skeleton--text skeleton--short"></span>
                <span class="skeleton skeleton--text" style="width:28px"></span>
            </div>
        </article>`).join("");
}

export function renderMatchSkeletons(count = 6) {
    return `<div class="skeleton-grid skeleton-grid--matches">${Array.from({ length: count }, () => `
        <article class="skeleton-match" aria-hidden="true">
            <div class="skeleton-card__top"><span class="skeleton skeleton--text skeleton--short"></span><span class="skeleton skeleton--text"></span></div>
            <div class="skeleton-match__teams">
                <div class="skeleton-match__team"><span class="skeleton skeleton--logo"></span><span class="skeleton skeleton--text skeleton--short"></span></div>
                <div class="skeleton-match__score"><span class="skeleton skeleton--title"></span><span class="skeleton skeleton--title"></span></div>
                <div class="skeleton-match__team"><span class="skeleton skeleton--logo"></span><span class="skeleton skeleton--text skeleton--short"></span></div>
            </div>
        </article>`).join("")}</div>`;
}

export function renderContentSkeletons(count = 3) {
    return `<div class="skeleton-content-grid">${Array.from({ length: count }, () => `
        <article class="skeleton-content-card" aria-hidden="true">
            <span class="skeleton skeleton--title skeleton--short"></span>
            <span class="skeleton skeleton--text"></span>
            <span class="skeleton skeleton--text skeleton--short"></span>
        </article>`).join("")}</div>`;
}

export function renderDetailSkeleton() {
    return `<div class="skeleton-detail">
        <div class="skeleton skeleton--title"></div>
        <div class="skeleton-detail__hero"><span class="skeleton skeleton--circle"></span><span class="skeleton skeleton--title"></span><span class="skeleton skeleton--circle"></span></div>
        <div class="skeleton-detail__tabs"><span class="skeleton skeleton--text"></span><span class="skeleton skeleton--text"></span><span class="skeleton skeleton--text"></span></div>
    </div>`;
}
