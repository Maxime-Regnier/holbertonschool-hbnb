(function () {
    "use strict";

    const fallbackApi = "http://127.0.0.1:5000/api/v1";
    const apiBase = window.location.origin && window.location.origin.startsWith("http")
        ? `${window.location.origin}/api/v1`
        : fallbackApi;

    function setCookie(name, value, days) {
        const expires = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toUTCString();
        document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
    }

    function getCookie(name) {
        const cookies = document.cookie ? document.cookie.split("; ") : [];
        for (const cookie of cookies) {
            const [key, ...valueParts] = cookie.split("=");
            if (key === name) {
                return decodeURIComponent(valueParts.join("="));
            }
        }
        return null;
    }

    function deleteCookie(name) {
        document.cookie = `${name}=; Max-Age=0; path=/; SameSite=Lax`;
    }

    function decodeBase64Url(value) {
        const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
        const padded = normalized + "=".repeat((4 - (normalized.length % 4)) % 4);
        return atob(padded);
    }

    function parseJwt(token) {
        try {
            const payload = token.split(".")[1];
            return JSON.parse(decodeBase64Url(payload));
        } catch (error) {
            return null;
        }
    }

    function getAuthData() {
        const token = getCookie("token");
        if (!token) {
            return { token: null, userId: null, isAdmin: false };
        }

        const payload = parseJwt(token) || {};
        return {
            token: token,
            userId: payload.sub || payload.identity || payload.user_id || payload.id || null,
            isAdmin: Boolean(payload.is_admin)
        };
    }

    function requireAuth(redirectTo) {
        const auth = getAuthData();
        if (!auth.token) {
            window.location.href = redirectTo;
            return null;
        }
        return auth;
    }

    function setMessage(element, message) {
        if (element) {
            element.textContent = message || "";
        }
    }

    async function apiRequest(path, options = {}) {
        const method = options.method || "GET";
        const auth = getAuthData();
        const headers = {};

        if (options.body !== undefined) {
            headers["Content-Type"] = "application/json";
        }
        if (auth.token) {
            headers.Authorization = `Bearer ${auth.token}`;
        }

        const response = await fetch(`${apiBase}${path}`, {
            method: method,
            headers: headers,
            body: options.body !== undefined ? JSON.stringify(options.body) : undefined
        });

        let payload = null;
        try {
            payload = await response.json();
        } catch (error) {
            payload = null;
        }

        if (!response.ok) {
            if (response.status === 401) {
                deleteCookie("token");
            }
            const message = payload && (payload.error || payload.message)
                ? payload.error || payload.message
                : `Request failed (${response.status})`;
            throw new Error(message);
        }

        return payload;
    }

    function updateHeaderAuthLink() {
        const authLink = document.getElementById("auth-link");
        if (!authLink) {
            return;
        }

        const auth = getAuthData();
        if (!auth.token) {
            authLink.textContent = "Login";
            authLink.href = "/login.html";
            return;
        }

        authLink.textContent = "Logout";
        authLink.href = "#";
        authLink.addEventListener("click", function (event) {
            event.preventDefault();
            deleteCookie("token");
            window.location.href = "/login.html";
        });
    }

    function getQueryParam(name) {
        return new URLSearchParams(window.location.search).get(name);
    }

    function getCountryLabel(place) {
        const candidates = [
            place.country,
            place.location && place.location.country,
            place.address && place.address.country
        ];

        for (const candidate of candidates) {
            if (typeof candidate === "string" && candidate.trim()) {
                return candidate.trim();
            }
        }

        return "Unknown";
    }

    function createPlaceCard(place) {
        const card = document.createElement("article");
        card.className = "place-card";

        const title = document.createElement("h3");
        title.textContent = place.title || "Untitled place";

        const price = document.createElement("p");
        price.textContent = `Price per night: $${Number(place.price || 0).toFixed(2)}`;

        const country = document.createElement("p");
        country.textContent = `Country: ${place.country}`;

        const details = document.createElement("a");
        details.className = "details-button";
        details.href = `/place.html?id=${encodeURIComponent(place.id)}`;
        details.textContent = "View Details";

        card.appendChild(title);
        card.appendChild(price);
        card.appendChild(country);
        card.appendChild(details);
        return card;
    }

    async function loadPlacesPage() {
        const auth = requireAuth("/login.html");
        if (!auth) {
            return;
        }

        const statusMessage = document.getElementById("status-message");
        const placesContainer = document.getElementById("places-container");
        const countryFilter = document.getElementById("country-filter");

        setMessage(statusMessage, "Loading places...");

        let places;
        try {
            const payload = await apiRequest("/places/");
            places = Array.isArray(payload) ? payload : [];
        } catch (error) {
            setMessage(statusMessage, error.message);
            return;
        }

        places = places.map(function (place) {
            return {
                id: place.id,
                title: place.title,
                price: place.price,
                country: getCountryLabel(place)
            };
        });

        if (places.length === 0) {
            setMessage(statusMessage, "No places available yet.");
            return;
        }

        const countries = ["all"].concat(Array.from(new Set(places.map(function (place) {
            return place.country;
        })))).sort();

        for (const country of countries) {
            if (country === "all") {
                continue;
            }
            const option = document.createElement("option");
            option.value = country;
            option.textContent = country;
            countryFilter.appendChild(option);
        }

        function renderPlaces() {
            const selectedCountry = countryFilter.value;
            const filtered = selectedCountry === "all"
                ? places
                : places.filter(function (place) {
                    return place.country === selectedCountry;
                });

            placesContainer.innerHTML = "";
            for (const place of filtered) {
                placesContainer.appendChild(createPlaceCard(place));
            }

            if (filtered.length === 0) {
                setMessage(statusMessage, "No places match the selected country.");
            } else {
                setMessage(statusMessage, `${filtered.length} place(s) found.`);
            }
        }

        countryFilter.addEventListener("change", renderPlaces);
        renderPlaces();
    }

    function renderPlaceDetails(place) {
        const container = document.getElementById("place-details");
        if (!container) {
            return;
        }

        const amenities = Array.isArray(place.amenities) && place.amenities.length
            ? `<ul>${place.amenities.map(function (amenity) { return `<li>${amenity.name}</li>`; }).join("")}</ul>`
            : "<p>No amenities listed.</p>";

        const description = place.description && place.description.trim()
            ? place.description
            : "No description available.";

        container.innerHTML = `
            <h2>${place.title || "Place details"}</h2>
            <div class="place-info">
                <p><strong>Host:</strong> ${place.owner ? `${place.owner.first_name} ${place.owner.last_name}` : "Unknown"}</p>
                <p><strong>Price per night:</strong> $${Number(place.price || 0).toFixed(2)}</p>
                <p><strong>Latitude:</strong> ${place.latitude}</p>
                <p><strong>Longitude:</strong> ${place.longitude}</p>
            </div>
            <p><strong>Description:</strong> ${description}</p>
            <h3>Amenities</h3>
            ${amenities}
        `;
    }

    async function fetchUserName(userId, cache) {
        if (!userId) {
            return "Anonymous";
        }
        if (cache.has(userId)) {
            return cache.get(userId);
        }

        try {
            const user = await apiRequest(`/users/${encodeURIComponent(userId)}`);
            const name = `${user.first_name || ""} ${user.last_name || ""}`.trim() || "Anonymous";
            cache.set(userId, name);
            return name;
        } catch (error) {
            cache.set(userId, "Anonymous");
            return "Anonymous";
        }
    }

    async function loadPlacePage() {
        const placeId = getQueryParam("id");
        const statusMessage = document.getElementById("status-message");
        const reviewsContainer = document.getElementById("reviews-container");
        const addReviewLink = document.getElementById("add-review-link");
        const auth = getAuthData();

        if (auth.token) {
            addReviewLink.href = `/add_review.html?place_id=${encodeURIComponent(placeId || "")}`;
            addReviewLink.style.display = "inline-block";
        } else {
            addReviewLink.style.display = "none";
        }

        if (!placeId) {
            setMessage(statusMessage, "Missing place id in URL.");
            return;
        }

        setMessage(statusMessage, "Loading place details...");

        let place;
        try {
            place = await apiRequest(`/places/${encodeURIComponent(placeId)}`);
        } catch (error) {
            setMessage(statusMessage, error.message);
            return;
        }

        renderPlaceDetails(place);
        setMessage(statusMessage, "");

        const reviews = Array.isArray(place.reviews) ? place.reviews : [];
        reviewsContainer.innerHTML = "";

        if (reviews.length === 0) {
            reviewsContainer.textContent = "No reviews yet.";
            return;
        }

        const userNameCache = new Map();

        for (const review of reviews) {
            const reviewerName = await fetchUserName(review.user_id, userNameCache);
            const card = document.createElement("article");
            card.className = "review-card";

            const heading = document.createElement("h4");
            heading.textContent = reviewerName;

            const comment = document.createElement("p");
            comment.textContent = review.comment || review.text || "";

            const rating = document.createElement("p");
            rating.textContent = `Rating: ${review.rating}/5`;

            card.appendChild(heading);
            card.appendChild(comment);
            card.appendChild(rating);
            reviewsContainer.appendChild(card);
        }
    }

    async function loadAddReviewPage() {
        const auth = requireAuth("/index.html");
        if (!auth) {
            return;
        }

        const placeId = getQueryParam("place_id") || getQueryParam("id");
        if (!placeId) {
            window.location.href = "/index.html";
            return;
        }

        const form = document.getElementById("add-review-form");
        const errorMessage = document.getElementById("review-error");
        const placeTitle = document.getElementById("place-title");

        try {
            const place = await apiRequest(`/places/${encodeURIComponent(placeId)}`);
            placeTitle.textContent = `Reviewing: ${place.title || "Selected place"}`;
        } catch (error) {
            placeTitle.textContent = "Selected place";
        }

        form.addEventListener("submit", async function (event) {
            event.preventDefault();
            setMessage(errorMessage, "");

            const text = document.getElementById("text").value.trim();
            const rating = Number(document.getElementById("rating").value);

            if (!text || !rating) {
                setMessage(errorMessage, "Please fill comment and rating.");
                return;
            }

            try {
                await apiRequest("/reviews/", {
                    method: "POST",
                    body: {
                        text: text,
                        rating: rating,
                        user_id: auth.userId || "current-user",
                        place_id: placeId
                    }
                });
                window.location.href = `/place.html?id=${encodeURIComponent(placeId)}`;
            } catch (error) {
                setMessage(errorMessage, error.message);
            }
        });
    }

    function setupLoginPage() {
        if (getAuthData().token) {
            window.location.href = "/index.html";
            return;
        }

        const form = document.getElementById("login-form");
        const errorMessage = document.getElementById("login-error");

        form.addEventListener("submit", async function (event) {
            event.preventDefault();
            setMessage(errorMessage, "");

            const email = document.getElementById("email").value.trim();
            const password = document.getElementById("password").value;

            if (!email || !password) {
                setMessage(errorMessage, "Email and password are required.");
                return;
            }

            try {
                const payload = await apiRequest("/auth/login", {
                    method: "POST",
                    body: { email: email, password: password }
                });

                if (!payload || !payload.access_token) {
                    throw new Error("Login failed: missing token.");
                }

                setCookie("token", payload.access_token, 1);
                window.location.href = "/index.html";
            } catch (error) {
                setMessage(errorMessage, error.message);
            }
        });
    }

    document.addEventListener("DOMContentLoaded", function () {
        updateHeaderAuthLink();

        const page = document.body.dataset.page;
        if (page === "login") {
            setupLoginPage();
            return;
        }
        if (page === "index") {
            loadPlacesPage();
            return;
        }
        if (page === "place") {
            loadPlacePage();
            return;
        }
        if (page === "add_review") {
            loadAddReviewPage();
        }
    });
})();
