const readline = require("readline");
const { wordList } = require("./words");
let history = {}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const updateHistory = ({ guess, colours }) => {
  for (let position = 0; position < 5; position++) {
    const letter = guess[position];
    const colour = colours[position];
    history[letter] = history[letter] || [];
    history[letter].push({ colour, position });
  }
  return history;
};

const filterWords = ({ history, wordList }) => {
  let letters = Object.keys(history);
  for (let i = 0; i < letters.length; i++) {
    let l = letters[i];
    let blacks = history[l].filter((e) => e.colour === "b").map((e) => e.position);
    let yellows = history[l].filter((e) => e.colour === "y").map((e) => e.position);
    let greens = history[l].filter((e) => e.colour === "g").map((e) => e.position);
    let hasBlack = blacks.length > 0;
    let hasYellow = yellows.length > 0;
    let hasGreen = greens.length > 0;
    if (hasYellow) {
      // must have yellow letter in the word & must not have yellow letter at yellow position
      wordList = wordList.filter((word) => word.includes(l));
      yellows.forEach((e) => {
        wordList = wordList.filter((word) => word[e] !== l);
      });
    }
    if (hasBlack && hasGreen) {
      // must not have this letter at black position
      // must have this letter at green position
      blacks.forEach((e) => {
        wordList = wordList.filter((word) => word[e] !== l);
      });
      greens.forEach((e) => {
        wordList = wordList.filter((word) => word[e] === l);
      });
    }
    if (!hasBlack && hasGreen) {
      // must have letter at green location
      greens.forEach((e) => {
        wordList = wordList.filter((word) => word[e] === l);
      });
    }
    if (hasBlack && !hasGreen) {
      // must not have this letter anywhere
      wordList = wordList.filter((word) => !word.includes(l));
    }
  }
  return wordList.sort();
};

const getOccurences = ({ shortlist }) => {
  let letters = [];
  shortlist.forEach((word) => {
    word.split("").forEach((l) => {
      !letters.includes(l) ? letters.push(l) : null;
    });
  });
  letters = letters
    .map((e) => ({
      l: e,
      count: shortlist.filter((w) => w.includes(e)).length,
    }))
    .sort((a, b) => (a.count > b.count ? -1 : 1));
  return letters;
};

const getRecommendation = ({ letterRank, shortlist }) => {
  let defaultRec = shortlist[0];
  let top5 = letterRank.slice(0, 5).map((e) => e.l);
  top5.forEach((l) => {
    shortlist = [...shortlist].filter((w) => w.includes(l));
  });
  return shortlist[0] || defaultRec;
};

let play = (guess) => {
  guess = guess || "crane";
  let m1 = ` Try "${guess.toUpperCase()}". then tell me how you did here: ---> `;
  rl.question(m1, (colours) => {
    history = updateHistory({ guess, colours });
    let shortlist = filterWords({ history, wordList });
    let letterRank = getOccurences({ shortlist });

    let rec = getRecommendation({ letterRank, shortlist });
    play(rec);

    // rl.close();
  });
};

const main = () => {
  let opener = `
  Hello, I'm the Wordle Guesser. 
  
  I'm a really simple bot. I tell you what word to guess & you tell me how you did.
  So for example, if I tell you to try "CRANE" and you get back ⬛️ 🟩 ⬛️ 🟩 🟨  just type "bgbgy". 
  Then I'd give you a new word to try. 
  
  Simple right? Ok.. lets go!\n`;
  console.log(opener);
  play();
};

main();
