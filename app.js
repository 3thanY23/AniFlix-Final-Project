

let trendingID = ["1", "2", "3", "4", "5", "6", "7", "8"];
const animeWrapper = document.querySelector(".anime__list");
let isTrending = true;

async function renderTrending() {
  let trendingArr = [];

  for (let currentPage = 1; currentPage <= 5; currentPage++) {
    const response = await fetch("https://graphql.anilist.co", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: `
          query ($page: Int, $perPage: Int) {
            Page(page: $page, perPage: $perPage) {
              media {
                id
                title {
                  english
                  romaji
                }
                coverImage {
                  large
                }
                startDate {
                  year
                }
              }
            }
          }
        `,
        variables: {
          page: currentPage,
          perPage: 16,
        },
      }),
    });

    const data = (await response.json()).data.Page.media;
    trendingArr = trendingArr.concat(data);
  }

  animeWrapper.innerHTML = trendingArr
    .map((anime) => animeHTML(anime, isTrending))
    .join("");
}

async function renderAnime(search = "", filter) {
  document.getElementById("filter").style.display = "block";
  animeWrapper.innerHTML = '<i class="fa-solid fa-spinner spinner"></i>';
  animeWrapper.classList += " loading";

  if (!!search) {
    const response = await fetch("https://graphql.anilist.co", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: `
          query ($search: String) {
            Page {
              media(search: $search, type: ANIME) {
                id
                title {
                  english
                  romaji
                }
                startDate {
                  year
                }
                coverImage {
                  large
                }
              }
            }
          }
        `,
        variables: {
          search: search,
        },
      }),
    });

    const data = (await response.json()).data.Page.media.slice(0, 8);
    console.log(data);

    if (filter === "OLDEST-NEWEST") {
      data.sort((a, b) => a.startDate.year - b.startDate.year);
    } else if (filter === "NEWEST-OLDEST") {
      data.sort((a, b) => b.startDate.year - a.startDate.year);
    }

    setTimeout(() => {
      animeWrapper.classList.remove("loading");
      animeWrapper.innerHTML = data
        .map((anime) => animeHTML(anime, (isTrending = false)))
        .join("");
    }, 250);
  }
}

setTimeout(() => {
  renderTrending();
}, 10);

function animeHTML(anime) {
  const startYear = anime.startDate ? anime.startDate.year : "N/A";

  return `<div class="anime">
          <figure class="anime__img--wrapper">
            <img class="anime__img" src="${anime.coverImage.large}" alt="">
          </figure>
          <h2 class="anime__title">${
            anime.title.english || anime.title.romaji
          }</h2>
          <p class="anime__year">${startYear}</p>
        </div>`;
}

function searchFunction(event) {
  document.getElementById("filter").selectedIndex = "0";
  document.querySelector(
    ".search__results"
  ).innerHTML = `Search Results: ${event.target.value}`;
  renderAnimes(event.target.value);
}

document
  .querySelector(".search__bar")
  .addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
      document.activeElement.blur();
    }
  });
