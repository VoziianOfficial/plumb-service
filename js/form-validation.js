(function () {
  const validators = {
    full_name: function (value) {
      return value.trim().length >= 2 ? "" : "Please enter your full name.";
    },
    phone_number: function (value) {
      return value.replace(/\D/g, "").length >= 10 ? "" : "Please enter a valid phone number.";
    },
    zip_code: function (value) {
      return /^\d{5}(?:-\d{4})?$/.test(value.trim()) ? "" : "Please enter a valid ZIP code.";
    },
    service_needed: function (value) {
      return value.trim() ? "" : "Please choose a service.";
    },
    message: function (value) {
      return value.trim().length >= 12 ? "" : "Please add a few more details about the request.";
    }
  };

  function getErrorNode(field) {
    let node = field.querySelector(".field-error");

    if (!node) {
      node = document.createElement("span");
      node.className = "field-error";
      field.appendChild(node);
    }

    return node;
  }

  function setFieldState(input, message) {
    const field = input.closest(".field");
    if (!field) {
      return;
    }

    const errorNode = getErrorNode(field);
    errorNode.textContent = message;
    input.classList.toggle("is-error", Boolean(message));
    input.setAttribute("aria-invalid", String(Boolean(message)));
  }

  function validateInput(input) {
    const validator = validators[input.name];
    if (!validator) {
      return "";
    }

    const error = validator(input.value);
    setFieldState(input, error);
    return error;
  }

  function initForms() {
    document.querySelectorAll("[data-form]").forEach(function (form) {
      const status = form.querySelector(".form-status");
      const fields = form.querySelectorAll("input, select, textarea");

      fields.forEach(function (input) {
        const eventName = input.tagName === "SELECT" ? "change" : "input";
        input.addEventListener(eventName, function () {
          validateInput(input);
        });
      });

      form.addEventListener("submit", function (event) {
        event.preventDefault();

        let firstInvalid = null;
        let hasError = false;

        fields.forEach(function (input) {
          const error = validateInput(input);
          if (error && !firstInvalid) {
            firstInvalid = input;
          }
          if (error) {
            hasError = true;
          }
        });

        if (status) {
          status.classList.remove("is-error", "is-success");
        }

        if (hasError) {
          if (status) {
            status.textContent = "Please review the highlighted fields and try again.";
            status.classList.add("is-error");
          }
          if (firstInvalid) {
            firstInvalid.focus();
          }
          return;
        }

        form.reset();
        fields.forEach(function (input) {
          setFieldState(input, "");
        });

        if (status) {
          status.textContent = "Thanks. Your request is ready to be matched with local plumbing providers.";
          status.classList.add("is-success");
        }
      });
    });
  }

  window.BlueRouteForms = { init: initForms };
})();
