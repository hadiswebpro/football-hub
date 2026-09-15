// Stage 3.1 shared skeleton render helpers
export function renderMatchSkeletons(count = 6) {
    return `<div class="skeleton-grid skeleton-grid--matches">${Array.from({ length: count }, () => `
        <article class="skeleton-match">
            <div class="skeleton-card__top"><span class="skeleton skeleton--text skeleton--short"></span><span class="skeleton skeleton--text"></span></div>
            <div class="skeleton-match__teams">
                <div class="skeleton-match__team"><span class="skeleton skeleton--logo"></span><span class="skeleton skeleton--text skeleton--short"></span></div>
                <div class="skeleton-match__score"><span class="skeleton skeleton--title"></span><span class="skeleton skeleton--title"></span></div>
                <div class="skeleton-match__team"><span class="skeleton skeleton--logo"></span><span class="skeleton skeleton--text skeleton--short"></span></div>
            </div>
        </article>`).join("")}</div>`;
}

export function renderDetailSkeleton() {
    return `<div class="skeleton-detail">
        <div class="skeleton skeleton--title"></div>
        <div class="skeleton-detail__hero"><span class="skeleton skeleton--circle"></span><span class="skeleton skeleton--title"></span><span class="skeleton skeleton--circle"></span></div>
        <div class="skeleton-detail__tabs"><span class="skeleton skeleton--text"></span><span class="skeleton skeleton--text"></span><span class="skeleton skeleton--text"></span></div>
    </div>`;
}
