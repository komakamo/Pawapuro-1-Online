const HOME_FIELD_BONUS = 4;

const statTemplate = () => ({ games: 0, atBats: 0, hits: 0, runs: 0, homeRuns: 0 });

const makePlayer = (name, position, rating) => ({
    id: `${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Math.floor(Math.random() * 10000)}`,
    name,
    position,
    rating,
    stats: statTemplate()
});

export const createPlayer = (name, position, rating) => makePlayer(name, position, rating);

export function createInitialTeams() {
    return [
        {
            id: 'tokyo-dragons',
            name: 'Tokyo Dragons',
            record: { wins: 0, losses: 0, runs: 0 },
            players: [
                makePlayer('Shota Tanaka', 'SP', 84),
                makePlayer('Ren Nakamura', 'C', 78),
                makePlayer('Ichiro Aoki', 'RF', 82),
                makePlayer('Kenta Watanabe', '2B', 75),
                makePlayer('Daichi Morita', '1B', 77)
            ]
        },
        {
            id: 'osaka-thunder',
            name: 'Osaka Thunder',
            record: { wins: 0, losses: 0, runs: 0 },
            players: [
                makePlayer('Yuki Matsui', 'SP', 81),
                makePlayer('Sora Kimura', 'SS', 79),
                makePlayer('Haruto Fujii', 'CF', 74),
                makePlayer('Taiga Sano', 'LF', 76),
                makePlayer('Koki Yamashita', '3B', 72)
            ]
        },
        {
            id: 'nagoya-shields',
            name: 'Nagoya Shields',
            record: { wins: 0, losses: 0, runs: 0 },
            players: [
                makePlayer('Kazuki Inoue', 'SP', 80),
                makePlayer('Hiroto Maeda', 'C', 73),
                makePlayer('Shun Ito', 'CF', 70),
                makePlayer('Hayato Suzuki', '2B', 74),
                makePlayer('Masato Uehara', 'RF', 76)
            ]
        },
        {
            id: 'sapporo-aurora',
            name: 'Sapporo Aurora',
            record: { wins: 0, losses: 0, runs: 0 },
            players: [
                makePlayer('Riku Ishikawa', 'SP', 79),
                makePlayer('Naoki Hirano', 'C', 71),
                makePlayer('Souta Kobayashi', 'LF', 73),
                makePlayer('Atsushi Togo', '1B', 75),
                makePlayer('Yuma Takeda', 'SS', 78)
            ]
        }
    ];
}

export function generateSchedule(teams) {
    const schedule = [];
    let day = 1;

    for (let round = 0; round < 2; round += 1) {
        for (let i = 0; i < teams.length; i += 1) {
            for (let j = i + 1; j < teams.length; j += 1) {
                const homeTeam = round % 2 === 0 ? teams[i] : teams[j];
                const awayTeam = round % 2 === 0 ? teams[j] : teams[i];
                schedule.push({
                    day,
                    games: [
                        {
                            homeId: homeTeam.id,
                            awayId: awayTeam.id
                        }
                    ]
                });
                day += 1;
            }
        }
    }

    return schedule;
}

export function simulateGameDay(state) {
    if (state.currentDayIndex >= state.schedule.length) {
        return [];
    }

    const daySchedule = state.schedule[state.currentDayIndex];
    const results = daySchedule.games.map((game) => simulateGame(game, state.teams, daySchedule.day));

    state.currentDayIndex += 1;

    return results;
}

export function getStandings(teams) {
    return [...teams]
        .map((team) => ({
            ...team,
            games: team.record.wins + team.record.losses,
            pct: team.record.wins + team.record.losses === 0
                ? 0
                : team.record.wins / (team.record.wins + team.record.losses)
        }))
        .sort((a, b) => {
            if (b.pct !== a.pct) {
                return b.pct - a.pct;
            }
            return b.record.runs - a.record.runs;
        });
}

function simulateGame(matchup, teams, dayNumber) {
    const homeTeam = teams.find((team) => team.id === matchup.homeId);
    const awayTeam = teams.find((team) => team.id === matchup.awayId);

    if (!homeTeam || !awayTeam) {
        throw new Error('Schedule references a team that does not exist.');
    }

    let homeScore = calculateRuns(homeTeam, true);
    let awayScore = calculateRuns(awayTeam, false);

    while (homeScore === awayScore) {
        if (Math.random() > 0.5) {
            homeScore += 1;
        } else {
            awayScore += 1;
        }
    }

    if (homeScore > awayScore) {
        homeTeam.record.wins += 1;
        awayTeam.record.losses += 1;
    } else {
        awayTeam.record.wins += 1;
        homeTeam.record.losses += 1;
    }

    homeTeam.record.runs += homeScore;
    awayTeam.record.runs += awayScore;

    updatePlayerStats(homeTeam, homeScore);
    updatePlayerStats(awayTeam, awayScore);

    return {
        day: dayNumber,
        homeTeam: homeTeam.name,
        awayTeam: awayTeam.name,
        homeScore,
        awayScore,
        winner: homeScore > awayScore ? homeTeam.name : awayTeam.name
    };
}

function calculateRuns(team, isHome) {
    const averageRating = team.players.reduce((sum, player) => sum + player.rating, 0) / team.players.length;
    const homeBonus = isHome ? HOME_FIELD_BONUS : 0;
    const expectedRuns = 3 + (averageRating + homeBonus - 70) / 6;
    const randomness = (Math.random() - Math.random()) * 2.5;
    const runs = Math.max(0, Math.round(expectedRuns + randomness));
    return runs;
}

function updatePlayerStats(team, runsScored) {
    team.players.forEach((player) => {
        const atBats = randomBetween(3, 5);
        const hitProbability = player.rating / 130;
        let hits = 0;
        for (let i = 0; i < atBats; i += 1) {
            if (Math.random() < hitProbability) {
                hits += 1;
            }
        }

        player.stats.games += 1;
        player.stats.atBats += atBats;
        player.stats.hits += hits;

        if (Math.random() < 0.15) {
            player.stats.homeRuns += 1;
        }
    });

    let runsRemaining = runsScored;
    while (runsRemaining > 0) {
        const player = team.players[Math.floor(Math.random() * team.players.length)];
        player.stats.runs += 1;
        runsRemaining -= 1;
    }
}

function randomBetween(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
