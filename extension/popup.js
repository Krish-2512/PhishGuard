chrome.tabs.query(
  { active: true, currentWindow: true },
  async function (tabs) {

    let currentUrl = tabs[0].url;

    document.getElementById("url").innerText = currentUrl;

    try {

      const response = await fetch(
        `http://127.0.0.1:8000/predict?url=${encodeURIComponent(currentUrl)}`
      );

      const data = await response.json();

      console.log(data);

      const resultBox = document.getElementById("result");

      resultBox.innerText = data.verdict;

      if (data.verdict.includes("Safe")) {
        resultBox.style.background = "green";
      }
      else if (data.verdict.includes("Suspicious")) {
        resultBox.style.background = "orange";
      }
      else {
        resultBox.style.background = "red";
      }

    }
    catch (error) {

      console.error(error);

      document.getElementById("result").innerText =
        "Cannot connect to backend";

    }

  }
);