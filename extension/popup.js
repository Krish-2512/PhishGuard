chrome.tabs.query(
  { active: true, currentWindow: true },
  async function (tabs) {
    if (!tabs || !tabs[0] || !tabs[0].url) {
      document.getElementById("url").innerText = "No active URL found";
      document.getElementById("result").innerText = "Idle";
      return;
    }

    let currentUrl = tabs[0].url;
    document.getElementById("url").innerText = currentUrl;

    const resultBox = document.getElementById("result");
    const reasonsBox = document.getElementById("reasons");

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/predict?url=${encodeURIComponent(currentUrl)}`
      );

      const data = await response.json();
      console.log("PhishGuard scan result:", data);

      if (data.error || !data.verdict) {
        resultBox.innerText = "Scan Error";
        resultBox.style.background = "#64748b";
        return;
      }

      resultBox.innerText = data.verdict;

      if (data.verdict.includes("Safe")) {
        resultBox.style.background = "#16a34a";
      }
      else if (data.verdict.includes("Suspicious")) {
        resultBox.style.background = "#d97706";
      }
      else {
        resultBox.style.background = "#dc2626";
      }

      if (reasonsBox && data.reasons && data.reasons.length > 0) {
        reasonsBox.innerHTML = "";
        data.reasons.forEach(function (reason) {
          const item = document.createElement("div");
          item.className = "reason-item";
          item.innerText = "• " + reason;
          reasonsBox.appendChild(item);
        });
        reasonsBox.style.display = "block";
      }

    }
    catch (error) {
      console.error("PhishGuard error:", error);
      resultBox.innerText = "Cannot connect to backend";
      resultBox.style.background = "#64748b";
      if (reasonsBox) {
        reasonsBox.style.display = "none";
      }
    }
  }
);