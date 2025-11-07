import {
    createInitialTeams,
    createPlayer,
    generateSchedule,
    simulateGameDay,
    getStandings
} from './simulation.js';

const state = {
    teams: createInitialTeams(),
    schedule: [],
    currentDayIndex: 0,
    results: []
};

state.schedule = generateSchedule(state.teams);

const elements = {
    teamSelect: document.getElementById('team-select'),
    rosterList: document.getElementById('roster-list'),
    addPlayerForm: document.getElementById('add-player-form'),
    playerName: document.getElementById('player-name'),
    playerPosition: document.getElementById('player-position'),
    playerRating: document.getElementById('player-rating'),
    scheduleBody: document.getElementById('schedule-body'),
    standingsBody: document.getElementById('standings-body'),
    resultsList: document.getElementById('results-list'),
    currentDay: document.getElementById('current-day'),
    totalDays: document.getElementById('total-days'),
    simulateButton: document.getElementById('simulate-day')
};

function init() {
    renderTeamSelect();
    renderRoster();
    renderSchedule();
    renderStandings();
    renderResults();
    updateDayLabels();
    registerEvents();
}

function registerEvents() {
    elements.teamSelect.addEventListener('change', () => {
        renderRoster();
    });

    elements.addPlayerForm.addEventListener('submit', (event) => {
        event.preventDefault();
        addPlayer();
    });

    elements.simulateButton.addEventListener('click', () => {
        simulateDay();
    });
}

function renderTeamSelect() {
    const previousSelection = elements.teamSelect.value;
    elements.teamSelect.innerHTML = '';
    state.teams.forEach((team) => {
        const option = document.createElement('option');
        option.value = team.id;
        option.textContent = team.name;
        elements.teamSelect.appendChild(option);
    });

    if (state.teams.some((team) => team.id === previousSelection)) {
        elements.teamSelect.value = previousSelection;
    } else if (state.teams.length > 0) {
        elements.teamSelect.value = state.teams[0].id;
    }
}

function renderRoster() {
    const team = getSelectedTeam();
    if (!team) {
        elements.rosterList.innerHTML = '<li class="empty">No team selected.</li>';
        return;
    }

    elements.rosterList.innerHTML = '';

    if (team.players.length === 0) {
        elements.rosterList.innerHTML = '<li class="empty">No players on this roster.</li>';
        return;
    }

    team.players.forEach((player) => {
        const item = document.createElement('li');
        const info = document.createElement('div');
        info.className = 'player-info';

        const average = player.stats.atBats ? player.stats.hits / player.stats.atBats : 0;
        const formattedAverage = formatAverage(average);

        info.innerHTML = `
            <strong>${player.name}</strong>
            <span>${player.position} · Rating ${player.rating}</span>
            <span>AVG ${formattedAverage} | HR ${player.stats.homeRuns} | R ${player.stats.runs}</span>
        `;

        const removeButton = document.createElement('button');
        removeButton.type = 'button';
        removeButton.className = 'secondary';
        removeButton.textContent = 'Remove';
        removeButton.addEventListener('click', () => {
            removePlayer(team.id, player.id);
        });

        item.appendChild(info);
        item.appendChild(removeButton);
        elements.rosterList.appendChild(item);
    });
}

function renderSchedule() {
    elements.scheduleBody.innerHTML = '';

    state.schedule.forEach((daySchedule, index) => {
        daySchedule.games.forEach((game) => {
            const row = document.createElement('tr');
            if (index < state.currentDayIndex) {
                row.classList.add('completed');
            }
            if (index === state.currentDayIndex) {
                row.classList.add('current');
            }

            const homeTeam = getTeamName(game.homeId);
            const awayTeam = getTeamName(game.awayId);

            row.innerHTML = `
                <td>Day ${daySchedule.day}</td>
                <td>${homeTeam}</td>
                <td>${awayTeam}</td>
            `;

            elements.scheduleBody.appendChild(row);
        });
    });
}

function renderStandings() {
    const standings = getStandings(state.teams);
    elements.standingsBody.innerHTML = '';

    standings.forEach((team) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${team.name}</td>
            <td>${team.record.wins}</td>
            <td>${team.record.losses}</td>
            <td>${team.pct.toFixed(3)}</td>
            <td>${team.record.runs}</td>
        `;
        elements.standingsBody.appendChild(row);
    });
}

function renderResults() {
    elements.resultsList.innerHTML = '';
    const recentResults = state.results.slice().reverse().slice(0, 8);

    if (recentResults.length === 0) {
        elements.resultsList.innerHTML = '<li class="empty">No games played yet.</li>';
        return;
    }

    recentResults.forEach((result) => {
        const item = document.createElement('li');
        item.innerHTML = `
            <strong>Day ${result.day}</strong>
            <span>${result.awayTeam} ${result.awayScore} @ ${result.homeTeam} ${result.homeScore}</span>
            <span>Winner: ${result.winner}</span>
        `;
        elements.resultsList.appendChild(item);
    });
}

function addPlayer() {
    const team = getSelectedTeam();
    if (!team) {
        return;
    }

    const name = elements.playerName.value.trim();
    const position = elements.playerPosition.value.trim();
    const rating = Number.parseInt(elements.playerRating.value, 10);

    if (!name || !position || Number.isNaN(rating)) {
        return;
    }

    const sanitizedRating = Math.min(100, Math.max(1, rating));
    team.players.push(createPlayer(name, position, sanitizedRating));

    elements.addPlayerForm.reset();
    elements.playerRating.value = 60;

    renderRoster();
}

function removePlayer(teamId, playerId) {
    const team = state.teams.find((entry) => entry.id === teamId);
    if (!team) {
        return;
    }

    team.players = team.players.filter((player) => player.id !== playerId);
    renderRoster();
}

function simulateDay() {
    const results = simulateGameDay(state);
    if (results.length === 0) {
        elements.simulateButton.disabled = true;
        elements.simulateButton.textContent = 'Season Complete';
        updateDayLabels();
        return;
    }

    state.results.push(...results);

    renderResults();
    renderStandings();
    renderRoster();
    renderSchedule();
    updateDayLabels();
}

function updateDayLabels() {
    const totalDays = state.schedule.length > 0 ? state.schedule[state.schedule.length - 1].day : 0;
    const upcomingDay = state.schedule[state.currentDayIndex]?.day ?? totalDays;

    elements.totalDays.textContent = totalDays;
    elements.currentDay.textContent = upcomingDay;

    if (state.currentDayIndex >= state.schedule.length) {
        elements.simulateButton.disabled = true;
        elements.simulateButton.textContent = 'Season Complete';
    } else {
        elements.simulateButton.disabled = false;
        elements.simulateButton.textContent = `Simulate Day ${upcomingDay}`;
    }
}

function getSelectedTeam() {
    const selectedId = elements.teamSelect.value || state.teams[0]?.id;
    return state.teams.find((team) => team.id === selectedId) ?? null;
}

function getTeamName(teamId) {
    return state.teams.find((team) => team.id === teamId)?.name ?? 'Unknown';
}

function formatAverage(value) {
    return value ? value.toFixed(3).slice(1) : '.000';
}

init();
