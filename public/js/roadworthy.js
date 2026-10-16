const username = requireAuth();
paintNavUser();

const checklistIds = ["headlights", "brakes", "horn", "mirrors", "tires", "muffler", "plateVisible", "sidecar"];

if (!findUser(username).tricycle) {
  document.getElementById("no-unit-notice").style.display = "block";
  document.getElementById("checklist-card").style.display = "none";
}

document.getElementById("check-btn").addEventListener("click", function () {
  const checklist = {};
  checklistIds.forEach(id => { checklist[id] = document.getElementById(id).checked; });

  const result = recordRoadworthyCheck(username, checklist);
  const resultBox = document.getElementById("result");

  if (result.passed) {
    resultBox.innerHTML = `
      <div class="banner banner-success">
        Roadworthy! This check is valid for ${ROADWORTHY_VALID_DAYS} days — you're clear to renew during that window.
      </div>
    `;
  } else {
    const items = result.failedItems.map(k => `<li>${CHECKLIST_LABELS[k] || k}</li>`).join("");
    resultBox.innerHTML = `
      <div class="banner banner-danger">
        Not roadworthy yet. Fix the following, then run the check again before renewing:
        <ul>${items}</ul>
      </div>
    `;
  }
});
