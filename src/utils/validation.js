const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateRegistration({ name, username, email, password }) {
  if (!name.trim()) return "Name is required.";
  if (!username.trim()) return "Username is required.";
  if (!EMAIL_PATTERN.test(email.trim())) return "Enter a valid email address.";
  if (password.length < 6) return "Password must be at least 6 characters.";
  return "";
}

export function validateEmployee(employee, departments, validatePhone = true) {
  return getEmployeeValidationErrors(employee, departments, validatePhone)[0]?.message || "";
}

export function getEmployeeValidationErrors(employee, departments, validatePhone = true) {
  const errors = [];
  if (!employee.firstName.trim())
    errors.push({ field: "firstName", message: "First name is required." });
  if (!employee.lastName.trim())
    errors.push({ field: "lastName", message: "Last name is required." });
  if (!employee.email.trim()) {
    errors.push({ field: "email", message: "Email is required." });
  } else if (!EMAIL_PATTERN.test(employee.email.trim())) {
    errors.push({ field: "email", message: "Enter a valid email address." });
  }

  if (validatePhone && employee.phone && !/^\d{10}$/.test(employee.phone))
    errors.push({ field: "phone", message: "Mobile number must be exactly 10 digits." });
  if (validatePhone && employee.phone && !/^[6-9]/.test(employee.phone))
    errors.push({ field: "phone", message: "Mobile number must start with a digit from 6 to 9." });

  const age = Number(employee.age);
  if (!Number.isInteger(age) || age < 18 || age > 70)
    errors.push({ field: "age", message: "Age must be a whole number between 18 and 70." });
  if (!departments.includes(employee.department))
    errors.push({ field: "department", message: "Select a valid department." });

  return errors;
}
