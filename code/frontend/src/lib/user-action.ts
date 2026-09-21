// Simulated user database
const users: Array<{
  id: string;
  fullName: string;
  email: string;
  major: string;
  studentId: string;
  isActive: boolean;
}> = [];

export async function registerUser(formData: FormData) {
  try {
    const fullName = formData.get("fullName") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;
    const major = formData.get("major") as string;
    const studentId = formData.get("studentId") as string;
    const profilePicture = formData.get("profilePicture") as File;

    // Validation
    if (
      !fullName ||
      !email ||
      !password ||
      !confirmPassword ||
      !major ||
      !studentId
    ) {
      return { success: false, error: "All fields are required" };
    }

    if (password !== confirmPassword) {
      return { success: false, error: "Passwords do not match" };
    }

    if (password.length < 6) {
      return {
        success: false,
        error: "Password must be at least 6 characters long",
      };
    }

    // Check if user already exists
    const existingUser = users.find(
      (user) => user.email === email || user.studentId === studentId
    );
    if (existingUser) {
      return {
        success: false,
        error: "User with this email or student ID already exists",
      };
    }

    // Simulate user creation
    const newUser = {
      id: Math.random().toString(36).substr(2, 9),
      fullName,
      email,
      major,
      studentId,
      isActive: true,
    };

    users.push(newUser);

    // In a real application, you would:
    // - Hash the password
    // - Store the user in a database
    // - Upload the profile picture to storage
    // - Send a welcome email

    console.log("New user registered:", newUser);
    console.log("Profile picture:", profilePicture?.name || "No file uploaded");

    return { success: true };
  } catch (error) {
    console.error("Registration error:", error);
    return { success: false, error: "Registration failed" };
  }
}

export async function deactivateUser(formData: FormData) {
  try {
    const email = formData.get("email") as string;

    if (!email) {
      return { success: false, error: "Email address is required" };
    }

    // Find user by email
    const userIndex = users.findIndex((user) => user.email === email);

    if (userIndex === -1) {
      return { success: false, error: "User not found" };
    }

    if (!users[userIndex].isActive) {
      return { success: false, error: "User account is already deactivated" };
    }

    // Deactivate user
    users[userIndex].isActive = false;

    // In a real application, you would:
    // - Update the user status in the database
    // - Log the deactivation action
    // - Send notification emails
    // - Revoke active sessions

    console.log("User deactivated:", users[userIndex]);

    return { success: true };
  } catch (error) {
    console.error("Deactivation error:", error);
    return { success: false, error: "Deactivation failed" };
  }
}
