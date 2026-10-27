
let rows = [], selected = "ALL";
const $ = id => document.getElementById(id);

function esc(s) {
    return String(s ?? "").replace(/[&<>"']/g, c => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    }[c]));
}

function normalize(ranks, names) {
    return Object.entries(ranks || {}).map(([id, v]) => ({
        id: String(id),
        name: (names || {})[String(id)] ||
            (typeof v === "string" ? id :
                (v?.name || v?.username || v?.player_name || id)),
        rank: typeof v === "string" ? v :
            (v?.rank || v?.tier || v?.rank_name || "UNRANKED")
    }));
}

function getMate(id, teams, names) {
    const v = (teams || {})[String(id)];

    function findName(tid) {
        const key = String(tid);

        if (names && names[key]) {
            return names[key];
        }

        const matchingId = Object.keys(names || {}).find(
            playerId => Number(playerId) === Number(tid)
        );

        return matchingId ? names[matchingId] : key;
    }

    if (typeof v === "string") {
        return findName(v);
    }

    if (v && typeof v === "object") {
        const tid = v.teammate;

        if (tid !== undefined && tid !== null) {
            return (
                findName(tid) ||
                v.teammate_name ||
                v.partner_name ||
                String(tid)
            );
        }
    }

    return "";
}
function render() {
    const q = $("searchInput").value.trim().toLowerCase();

    const list = rows.filter(p =>
        (selected === "ALL" || p.rank.toUpperCase() === selected) &&
        (
            p.name.toLowerCase().includes(q) ||
            p.teammate.toLowerCase().includes(q)
        )
    ).sort((a, b) => {
        const order = [
            "HT1", "LT1", "HT2", "LT2", "HT3",
            "LT3", "HT4", "LT4", "HT5", "LT5"
        ];

        return (
            (order.indexOf(a.rank) < 0 ? 99 : order.indexOf(a.rank)) -
            (order.indexOf(b.rank) < 0 ? 99 : order.indexOf(b.rank))
        ) || a.name.localeCompare(b.name);
    });

    const seen = new Set();
    const pairs = [];


for (const p of list) {
    const k = p.teammate
        ? [p.id, p.teammateId || p.teammate]
            .map(id => String(id))
            .sort()
            .join("|")
        : p.id;

    if (seen.has(k)) continue;

    seen.add(k);
    pairs.push(p);
}


    $("players").innerHTML = pairs.length
        ? pairs.map(p => `
            <tr>
                <td>
                    <span class="player">
                        ${esc(p.name)}
                        ${p.teammate
                            ? ` <span class="plus">+</span> ${esc(p.teammate)}`
                            : ""}
                    </span>
                </td>
                <td>
                    <span class="tier tier-${/^[HL]T[1-5]$/.test(p.rank) ? p.rank : ""}">
                        ${esc(p.rank)}
                    </span>
                </td>
                <td>
                    ${p.teammate
                        ? '<span class="team">● DUO</span>'
                        : '<span class="muted">SOLO</span>'}
                </td>
                <td>
                    ${p.teammate
                        ? '<span class="muted">Последняя протестированная пара</span>'
                        : '<span class="muted">Нет напарника</span>'}
                </td>
            </tr>
        `).join("")
        : '<tr><td colspan="4" class="empty">Игроки не найдены</td></tr>';

    $("resultCount").textContent =
        `${pairs.length} / ${rows.length} команд и игроков`;
}

async function load() {
    try {
        const r = await fetch("/api/ranks", { cache: "no-store" });

        if (!r.ok) throw Error("Не удалось загрузить рейтинг");

        const d = await r.json();
        const names = d.player_names || {};

        rows = normalize(d.ranks, names);

        rows.forEach(p => {
            p.teammate = getMate(p.id, d.teams, names);

            const v = (d.teams || {})[p.id];

            p.teammateId = v && typeof v === "object"
                ? String(v.teammate || "")
                : typeof v === "string" ? v : "";
        });

        $("playerCount").textContent = rows.length;

        const pairs = new Set();

        rows.forEach(p => {
            if (p.teammate) {
                pairs.add(
                    [p.id, p.teammateId || p.teammate]
                        .map(String).sort().join("|")
                );
            }
        });

        $("teamCount").textContent = pairs.size;

        const date = new Date(d.updated_at);

        $("lastUpdated").textContent = isNaN(date)
            ? "—"
            : date.toLocaleTimeString("ru-RU", {
                hour: "2-digit",
                minute: "2-digit"
            });

        render();
    } catch (e) {
        $("players").innerHTML =
            '<tr><td colspan="4" class="empty">Не удалось загрузить данные. Попробуйте позже.</td></tr>';
    }
}

$("searchInput").addEventListener("input", render);

$("filters").addEventListener("click", e => {
    const b = e.target.closest("button[data-tier]");

    if (!b) return;

    selected = b.dataset.tier;

    document.querySelectorAll("#filters button").forEach(x =>
        x.classList.toggle("active", x === b)
    );

    render();
});

load();
setInterval(load, 30000);
