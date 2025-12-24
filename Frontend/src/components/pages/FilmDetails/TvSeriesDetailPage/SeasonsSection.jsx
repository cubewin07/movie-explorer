import SeasonAccordion from '../SeasonAccordion';

export default function SeasonsSection({
    seasons,
    tvId,
    openSeason,
    onToggleSeason,
}) {
    return (
        <div className="space-y-4">
            {seasons?.map((season) => (
                <SeasonAccordion
                    key={season.id}
                    tvId={tvId}
                    seasonNumber={season.season_number}
                    season={season}
                    open={openSeason === season.season_number}
                    onToggle={() =>
                        onToggleSeason(openSeason === season.season_number ? null : season.season_number)
                    }
                />
            ))}
        </div>
    );
}
