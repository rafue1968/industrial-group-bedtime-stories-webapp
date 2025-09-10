// src/components/CreateUserIfNotExist.js

const CreateUserIfNotExists = async (user) => {
  if (!user) return;

  try {
    const res = await fetch("/api/createUserIfNotExist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        uid: user.uid,
        email: user.email,
      }),
    });

    const data = await res.json();
    console.log("API response:", data);

    return data; // { success: true, message: "..."}
  } catch (err) {
    console.error("❌ Error calling API:", err);
    throw err;
  }
};

export default CreateUserIfNotExists;
