
// Simple check-in logic for the event
(function() {
	// Elements
	var form = document.getElementById('checkInForm');
	var nameInput = document.getElementById('attendeeName');
	var teamSelect = document.getElementById('teamSelect');
	var attendeeCountSpan = document.getElementById('attendeeCount');
	var progressBar = document.getElementById('progressBar');
	var greetingEl = document.getElementById('greeting');

	// Team count elements map (values match the select option values)
	var teamCountMap = {
		water: document.getElementById('waterCount'),
		zero: document.getElementById('zeroCount'),
		power: document.getElementById('powerCount')
	};

		// State
		var totalAttendees = 0; // increments on each submit
		var maxAttendees = 50; // goal for percentage calculations

		// persisted data shape
		// { total: number, teams: {water,zero,power}, entries: [{name,team,timestamp}] }
		var persisted = {
			total: 0,
			teams: { water: 0, zero: 0, power: 0 },
			entries: []
		};

		// Try to load from localStorage (provided by data.js)
		if (window.CheckInData && typeof window.CheckInData.load === 'function') {
			var loaded = window.CheckInData.load();
			if (loaded && typeof loaded === 'object') {
				persisted = loaded;
				totalAttendees = persisted.total || 0;
				// restore team counts into DOM
				if (persisted.teams) {
					if (teamCountMap.water) teamCountMap.water.textContent = persisted.teams.water || 0;
					if (teamCountMap.zero) teamCountMap.zero.textContent = persisted.teams.zero || 0;
					if (teamCountMap.power) teamCountMap.power.textContent = persisted.teams.power || 0;
				}
			}
		}

	// Helper to update progress UI
	function updateProgress() {
		var percent = 0;
		if (maxAttendees > 0) {
			percent = Math.min(100, Math.round((totalAttendees / maxAttendees) * 100));
		}
		attendeeCountSpan.textContent = totalAttendees;
		progressBar.style.width = percent + '%';
	}

	// Celebration overlay elements
	var celebrationOverlay = document.getElementById('celebrationOverlay');
	var winningTeamLabelEl = document.getElementById('winningTeamLabel');
	var celebrationCard = document.getElementById('celebrationCard');
	var closeCelebration = document.getElementById('closeCelebration');

	// Per-team list elements
	var waterListEl = document.getElementById('waterList');
	var zeroListEl = document.getElementById('zeroList');
	var powerListEl = document.getElementById('powerList');

	function determineWinningTeam(teamsObj) {
		teamsObj = teamsObj || { water: 0, zero: 0, power: 0 };
		var winner = 'water';
		var max = teamsObj[winner] || 0;
		for (var k in teamsObj) {
			if (teamsObj[k] > max) {
				max = teamsObj[k];
				winner = k;
			}
		}
		return winner; // 'water' | 'zero' | 'power'
	}

	function showCelebration() {
		if (!celebrationOverlay) return;
		var winner = determineWinningTeam(persisted.teams);
		var teamLabels = { water: '🌊 Team Water Wise', zero: '🌿 Team Net Zero', power: '⚡ Team Renewables' };
		// set label and styling
		if (winningTeamLabelEl) {
			winningTeamLabelEl.textContent = teamLabels[winner] || 'Team';
			winningTeamLabelEl.className = '';
			winningTeamLabelEl.classList.add('winning-' + winner);
		}
		celebrationOverlay.style.display = 'flex';
		// Auto-hide after 6 seconds
		setTimeout(function() {
			hideCelebration();
		}, 6000);
	}

	function hideCelebration() {
		if (!celebrationOverlay) return;
		celebrationOverlay.style.display = 'none';
		if (winningTeamLabelEl) winningTeamLabelEl.className = '';
	}

	if (closeCelebration) {
		closeCelebration.addEventListener('click', hideCelebration);
	}

	// Helper to show greeting
	function showGreeting(name, teamLabel) {
		greetingEl.textContent = 'Welcome, ' + name + '! You are checked in for ' + teamLabel + '.';
		greetingEl.classList.add('success-message');
		greetingEl.style.display = 'block';
		// Auto-hide after 4 seconds
		setTimeout(function() {
			greetingEl.style.display = 'none';
		}, 4000);
	}

	// Form submit handler
	function onSubmit(event) {
		event.preventDefault();

		var name = nameInput.value.trim();
		var teamValue = teamSelect.value; // ex: 'water', 'zero', 'power'

		if (!name) {
			// simple validation - name required
			nameInput.focus();
			return;
		}

			// Increment total and team counts
			totalAttendees = totalAttendees + 1;
			persisted.total = totalAttendees;

			// Update the matching team count element text and persisted counts
			if (teamValue && teamCountMap[teamValue]) {
				var current = parseInt(teamCountMap[teamValue].textContent, 10) || 0;
				var next = current + 1;
				teamCountMap[teamValue].textContent = next;
				if (!persisted.teams) persisted.teams = { water: 0, zero: 0, power: 0 };
				persisted.teams[teamValue] = next;
			}

			// Add an entry record
			var entry = { name: name, team: teamValue, timestamp: Date.now() };
			persisted.entries = persisted.entries || [];
			persisted.entries.push(entry);

			// Save to localStorage if available
			if (window.CheckInData && typeof window.CheckInData.save === 'function') {
				window.CheckInData.save(persisted);
			}

			// Render per-team lists
			renderTeamLists();

		// Calculate and update progress
		updateProgress();

		// If we've reached the goal, show celebration
		if (totalAttendees >= maxAttendees) {
			showCelebration();
		}

		// Map team value to full label for greeting
		var teamLabels = {
			water: '🌊 Team Water Wise',
			zero: '🌿 Team Net Zero',
			power: '⚡ Team Renewables'
		};
		var teamLabel = teamLabels[teamValue] || 'the event team';

		// Show greeting
		showGreeting(name, teamLabel);

		// Reset form for next attendee
		form.reset();
		// Resetting the select will leave the disabled placeholder selected in supported browsers
		nameInput.focus();
	}

	// Wire up listener
	if (form) {
		form.addEventListener('submit', onSubmit);
	}

	// Quick test controls (Clear & Fill)
	var clearBtn = document.getElementById('clearBtn');
	var fillBtn = document.getElementById('fillBtn');

	function resetStateAndUI() {
		persisted = { total: 0, teams: { water: 0, zero: 0, power: 0 }, entries: [] };
		totalAttendees = 0;
		if (teamCountMap.water) teamCountMap.water.textContent = '0';
		if (teamCountMap.zero) teamCountMap.zero.textContent = '0';
		if (teamCountMap.power) teamCountMap.power.textContent = '0';
		updateProgress();
	}

	if (clearBtn) {
		clearBtn.addEventListener('click', function() {
			if (window.CheckInData && typeof window.CheckInData.clear === 'function') {
				window.CheckInData.clear();
			}
			resetStateAndUI();
			renderTeamLists();
		});
	}

	if (fillBtn) {
		fillBtn.addEventListener('click', function() {
			// Create 50 sample attendees distributed among teams
			var teams = ['water', 'zero', 'power'];
			var sample = { total: 50, teams: { water: 0, zero: 0, power: 0 }, entries: [] };
			for (var i = 1; i <= 50; i++) {
				var team = teams[i % 3];
				sample.teams[team] = (sample.teams[team] || 0) + 1;
				sample.entries.push({ name: 'Attendee ' + i, team: team, timestamp: Date.now() });
			}
			persisted = sample;
			totalAttendees = persisted.total;
			// update DOM
			if (teamCountMap.water) teamCountMap.water.textContent = persisted.teams.water;
			if (teamCountMap.zero) teamCountMap.zero.textContent = persisted.teams.zero;
			if (teamCountMap.power) teamCountMap.power.textContent = persisted.teams.power;
			updateProgress();
			if (window.CheckInData && typeof window.CheckInData.save === 'function') {
				window.CheckInData.save(persisted);
			}

			// If fill caused goal to be reached, show celebration
			if (totalAttendees >= maxAttendees) {
				showCelebration();
			}

			// Render per-team lists after fill
			renderTeamLists();
		});
	}

	// Render per-team attendee lists (grouped)
	function renderTeamLists() {
		var entries = persisted.entries || [];
		// clear
		if (waterListEl) waterListEl.innerHTML = '';
		if (zeroListEl) zeroListEl.innerHTML = '';
		if (powerListEl) powerListEl.innerHTML = '';
		// render in order (oldest first)
		for (var i = 0; i < entries.length; i++) {
			var e = entries[i];
			var li = document.createElement('li');
			li.textContent = e.name || 'Unknown';
			if (e.team === 'water' && waterListEl) waterListEl.appendChild(li);
			if (e.team === 'zero' && zeroListEl) zeroListEl.appendChild(li);
			if (e.team === 'power' && powerListEl) powerListEl.appendChild(li);
		}
	}

	// Initial render
	updateProgress();
	renderTeamLists();
})();
