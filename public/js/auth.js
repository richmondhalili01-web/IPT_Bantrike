const tabLogin = document.getElementById("tab-login");
const tabSignup = document.getElementById("tab-signup");
const loginForm = document.getElementById("login-form");
const signupForm = document.getElementById("signup-form");
const banner = document.getElementById("banner");

function redirectUser(user) {
  if (!user) return;
  const target = user.role === "admin" ? "admin.html" : "dashboard.html";
  window.location.href = target;
}

function setBanner(message) {
  if (!banner) return;
  banner.innerHTML = `<div class="banner banner-danger">${message}</div>`;
}

function showTab(which) {
  const isLoginTab = which === "login";

  if (tabLogin) {
    tabLogin.classList.toggle("active", isLoginTab);
  }

  if (tabSignup) {
    tabSignup.classList.toggle("active", !isLoginTab);
  }

  if (loginForm) {
    loginForm.style.display = isLoginTab ? "block" : "none";
  }

  if (signupForm) {
    signupForm.style.display = isLoginTab ? "none" : "block";
  }

  if (banner) {
    banner.innerHTML = "";
  }
}

const activeSessionUser = getSession() ? findUser(getSession()) : null;
if (activeSessionUser) {
  redirectUser(activeSessionUser);
}

if (tabLogin) {
  tabLogin.addEventListener("click", () => showTab("login"));
}

if (tabSignup) {
  tabSignup.addEventListener("click", () => showTab("signup"));
}

if (loginForm) {
  loginForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const username = document.getElementById("login-username")?.value.trim() ?? "";
    const password = document.getElementById("login-password")?.value ?? "";
    const user = findUser(username);

    if (!user || user.password !== password) {
      setBanner("Incorrect username or password.");
      return;
    }

    setSession(user.username);
    redirectUser(user);
  });
}

if (signupForm) {
  signupForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const fullName = document.getElementById("signup-fullname")?.value.trim() ?? "";
    const username = document.getElementById("signup-username")?.value.trim() ?? "";
    const password = document.getElementById("signup-password")?.value ?? "";

    if (!fullName || !username || !password) {
      setBanner("Please fill in every field.");
      return;
    }

    const user = createUser({ username, fullName, password });
    if (!user) {
      setBanner("That username is already taken.");
      return;
    }

    setSession(user.username);
    window.location.href = "dashboard.html";
  });
}
