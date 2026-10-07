"use strict";

(() => {
    const data = JSON.parse(document.getElementById("experiment-data").textContent);
    const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
    const integer = new Intl.NumberFormat("en-US");
    const formatMoney = value => value == null ? "—" : money.format(value);
    const summary = data.summary;
    const cards = [
        ["Respondents", integer.format(summary.respondents), `${summary.states - Number(data.states.some(row => row.state_code === "DC"))} states${data.states.some(row => row.state_code === "DC") ? " + DC" : ""} · ${summary.counties} counties`],
        ["Chose to donate", integer.format(summary.donors), `${(100 * summary.donors / summary.respondents).toFixed(1)}% of respondents`],
        ["Total donation amount", formatMoney(summary.total_donation_usd), "Gift-card donation choices"],
        ["Mean per respondent", formatMoney(summary.mean_donation_usd), "Includes non-donors at $0"]
    ];
    const grid = document.getElementById("summary-grid");
    cards.forEach(([label, value, detail]) => {
        const card = document.createElement("div");
        card.className = "summary-card";
        [["summary-label", label], ["summary-value", value], ["summary-detail", detail]].forEach(([className, content]) => {
            const element = document.createElement("div");
            element.className = className;
            element.textContent = content;
            card.appendChild(element);
        });
        grid.appendChild(card);
    });
    document.getElementById("sample-note").textContent = `Of ${integer.format(summary.source_responses)} exported responses, ${integer.format(summary.respondents)} completed live responses are included. Excluded: ${integer.format(summary.exclusions.incomplete || 0)} incomplete responses and ${integer.format(summary.exclusions.preview_or_non_live || 0)} preview or other non-live responses. All included responses have a matched county and a valid donation choice. No additional attention-check or timing exclusions were applied.`;

    const stateFilter = document.getElementById("state-filter");
    data.states.forEach(row => {
        const option = document.createElement("option");
        option.value = row.state_code;
        option.textContent = row.state;
        stateFilter.appendChild(option);
    });

    let geography = "counties";
    let sortKey = "state";
    let sortDescending = false;
    const columns = () => [
        ["state", "State"],
        ...(geography === "counties" ? [["county", "County"], ["fips", "FIPS"]] : [["counties", "Counties"]]),
        ["respondents", "Respondents"], ["donors", "Donors"],
        ["total_donation_usd", "Total donation"],
        ["mean_donation_usd", "Mean / respondent"],
        ["mean_donor_donation_usd", "Mean / donor"]
    ];
    const isNumeric = key => !["state", "county", "fips"].includes(key);
    const format = (key, value) => key.endsWith("_usd") ? formatMoney(value) : isNumeric(key) ? integer.format(value) : value;

    function drawTable() {
        const search = document.getElementById("table-search").value.trim().toLowerCase();
        const rows = data[geography].filter(row => (!stateFilter.value || row.state_code === stateFilter.value) && `${row.state} ${row.county || ""} ${row.fips || ""}`.toLowerCase().includes(search));
        rows.sort((a, b) => {
            // Keep undefined donor means at the end in either sort direction.
            if (a[sortKey] == null) return b[sortKey] == null ? 0 : 1;
            if (b[sortKey] == null) return -1;
            const order = isNumeric(sortKey) ? a[sortKey] - b[sortKey] : String(a[sortKey]).localeCompare(String(b[sortKey]));
            return (sortDescending ? -order : order) || (a.county || "").localeCompare(b.county || "");
        });
        document.getElementById("table-status").textContent = `Showing ${integer.format(rows.length)} of ${integer.format(data[geography].length)} ${geography}. Click a column heading to sort.`;
        document.getElementById("table-caption").textContent = geography === "counties" ? "County donation summary" : "State donation summary";
        const head = document.getElementById("results-head");
        const body = document.getElementById("results-body");
        head.replaceChildren();
        body.replaceChildren();
        const headings = document.createElement("tr");
        columns().forEach(([key, label]) => {
            const th = document.createElement("th");
            th.scope = "col";
            if (isNumeric(key)) th.className = "numeric";
            th.setAttribute("aria-sort", key === sortKey ? sortDescending ? "descending" : "ascending" : "none");
            const button = document.createElement("button");
            button.type = "button";
            button.textContent = label + (key === sortKey ? sortDescending ? " ↓" : " ↑" : "");
            button.addEventListener("click", () => {
                sortDescending = key === sortKey ? !sortDescending : isNumeric(key);
                sortKey = key;
                drawTable();
            });
            th.appendChild(button);
            headings.appendChild(th);
        });
        head.appendChild(headings);
        function appendRow(row, total = false) {
            const tr = document.createElement("tr");
            if (total) tr.className = "totals-row";
            columns().forEach(([key]) => {
                const td = document.createElement("td");
                if (isNumeric(key)) td.className = "numeric";
                td.textContent = row[key] == null && !key.endsWith("_usd") ? "" : format(key, row[key]);
                tr.appendChild(td);
            });
            body.appendChild(tr);
        }
        if (!rows.length) {
            const tr = document.createElement("tr");
            const td = document.createElement("td");
            td.colSpan = columns().length;
            td.className = "empty-results";
            td.textContent = "No results match this search.";
            tr.appendChild(td);
            body.appendChild(tr);
            return;
        }
        // Sum integer cents, then compute weighted means for the visible rows.
        const totalCents = rows.reduce((sum, row) => sum + Math.round(row.total_donation_usd * 100), 0);
        const respondents = rows.reduce((sum, row) => sum + row.respondents, 0);
        const donors = rows.reduce((sum, row) => sum + row.donors, 0);
        appendRow({ state: "Visible total", counties: rows.reduce((sum, row) => sum + (row.counties || 1), 0), respondents, donors, total_donation_usd: totalCents / 100, mean_donation_usd: totalCents / 100 / respondents, mean_donor_donation_usd: donors ? totalCents / 100 / donors : null }, true);
        rows.forEach(row => appendRow(row));
    }
    function switchView(value) {
        geography = value;
        if (!columns().some(([key]) => key === sortKey)) sortKey = "state";
        ["county", "state"].forEach(view => {
            const button = document.getElementById(`${view}-view`);
            const active = value === (view === "county" ? "counties" : "states");
            button.classList.toggle("active", active);
            button.setAttribute("aria-pressed", String(active));
        });
        drawTable();
    }
    document.getElementById("county-view").addEventListener("click", () => switchView("counties"));
    document.getElementById("state-view").addEventListener("click", () => switchView("states"));
    stateFilter.addEventListener("change", drawTable);
    document.getElementById("table-search").addEventListener("input", drawTable);
    drawTable();

    const measures = {
        mean_donation_usd: ["Mean donation per respondent", "Mean / respondent ($)"],
        mean_donor_donation_usd: ["Mean donation per donor", "Mean / donor ($)"],
        total_donation_usd: ["Total donation amount", "Total donation ($)"],
        donors: ["Number of donors", "Donors"],
        respondents: ["Number of respondents", "Respondents"]
    };
    const mapElement = document.getElementById("county-map");
    const layout = {
        margin: { l: 0, r: 0, t: 12, b: 5 },
        paper_bgcolor: "#ffffff",
        geo: { scope: "usa", projection: { type: "albers usa" }, showland: true, landcolor: "#d7d7d7", showlakes: true, lakecolor: "#ffffff", bgcolor: "#ffffff", subunitcolor: "#ffffff" },
        font: { family: "Arial, sans-serif", color: "#263331" },
        uirevision: "county-map",
    };
    const config = { responsive: true, displaylogo: false, modeBarButtonsToRemove: ["lasso2d", "select2d"], toImageButtonOptions: { filename: `${data.key}_county_donations`, format: "png", scale: 2 } };
    async function drawMap() {
        const key = document.getElementById("map-metric").value;
        const [title, legend] = measures[key];
        document.getElementById("map-heading").textContent = title;
        const rows = data.counties.filter(row => row[key] != null);
        const maximum = Math.max(...rows.map(row => row[key]), 1);
        const background = {
            type: "choropleth", geojson: window.JML_COUNTIES, featureidkey: "id", locationmode: "geojson-id",
            locations: window.JML_COUNTIES.features.map(feature => feature.id),
            z: window.JML_COUNTIES.features.map(() => 0), zmin: 0, zmax: 1,
            colorscale: [[0, "#d7d7d7"], [1, "#d7d7d7"]], showscale: false,
            marker: { line: { color: "#ffffff", width: 0.45 } },
            hoverinfo: "skip"
        };
        const trace = {
            type: "choropleth", geojson: window.JML_COUNTIES, featureidkey: "id", locationmode: "geojson-id",
            locations: rows.map(row => row.fips), z: rows.map(row => row[key]),
            zmin: 0, zmax: key.startsWith("mean_") ? 25 : maximum,
            colorscale: [[0, "#eef6fb"], [0.25, "#aacbdc"], [0.5, "#588db7"], [0.75, "#2c548c"], [1, "#1c316c"]],
            marker: { line: { color: "#000000", width: 0.7 } },
            colorbar: { title: { text: legend, side: "right" }, thickness: 14, len: 0.65, tickformat: key.endsWith("_usd") ? ".2f" : ",d" },
            customdata: rows.map(row => [`${row.county}, ${row.state_code}`, row.fips, row.respondents, row.donors, formatMoney(row.total_donation_usd), formatMoney(row.mean_donation_usd), formatMoney(row.mean_donor_donation_usd)]),
            hovertemplate: "<b>%{customdata[0]}</b><br>FIPS: %{customdata[1]}<br>Respondents: %{customdata[2]}<br>Donors: %{customdata[3]}<br>Total donation: %{customdata[4]}<br>Mean / respondent: %{customdata[5]}<br>Mean / donor: %{customdata[6]}<extra></extra>"
        };
        try {
            if (!window.Plotly) throw new Error("Map library unavailable");
            const status = document.getElementById("map-status");
            if (status) status.remove();
            await Plotly.react(mapElement, [background, trace], layout, config);
            mapElement.dataset.ready = "true";
        } catch (error) {
            mapElement.dataset.ready = "false";
            mapElement.replaceChildren();
            const message = document.createElement("p");
            message.className = "map-loading";
            message.textContent = "The map could not load. County and state results are available in the tables and CSV downloads below.";
            mapElement.appendChild(message);
            console.error("Donation map:", error);
        }
    }
    document.getElementById("map-metric").addEventListener("change", drawMap);
    drawMap();
})();
