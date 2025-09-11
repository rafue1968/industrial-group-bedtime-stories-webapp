"use client";

// import { useAuthRedirect } from "../../hooks/useAuthRedirect";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getDoc, doc } from "firebase/firestore";
import { auth, firestore } from "../../../lib/firebase";
import { onAuthStateChanged,signOut } from "firebase/auth";
import Loading from "../../components/Loading"
import NavigationBar from "../../components/NavigationBar";
import { getDisplayName } from "next/dist/shared/lib/utils";




export default function ProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formValues, setFormValues] = useState({});

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDoc = await getDoc(doc(firestore, "users", user.uid));

        const data = userDoc.data();
        const profile = {
          displayName: data.displayName || "",
          email: data.email || user.email,
          phoneNumber: data.phoneNumber || "",
          password: "", 
        };

        setUserProfile(profile);   
        setFormValues(profile);   
        setLoading(false); 

      } else {
          alert("Sorry. Please login first.")
          router.push("/login")
      }
    });

    return () => unsubscribe();
  }, []);

  const handleInputChange = (e) => {
    setFormValues({ ...formValues, [e.target.name]: e.target.value });
  };

  const handleSaveProfile = async () => {
    if (!auth.currentUser) return alert("Not logged in");

    const changes = {};
    for (let key in formValues) {
      if (formValues[key] !== userProfile[key] && key !== "password") {
        changes[key] = formValues[key];
      }
    }

    if (formValues.password.trim() !== "") {
      changes.password = formValues.password;
    }


    if (Object.keys(changes).length === 0) {
      alert("No changes made");
      setIsEditing(false);
      return;
    }

    try {
      const token = await auth.currentUser.getIdToken();
      const res = await fetch("/api/update-profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(changes),
      });

      const data = await res.json();

      if (res.ok) {
        alert("Profile updated successfully");
        setUserProfile({ ...userProfile, ...changes });
        setIsEditing(false);
      } else {
        alert("Error: " + data.error);
      }
    } catch (error) {
      console.error("Update error:", error);
      alert("Unexpected error occurred");
    }
  };

  const handleDeleteAccount = async () => {
    if (!auth.currentUser) return alert("Not logged in");

    const confirmed = window.confirm(
      "Are you sure you want to delete your account? All your data will be permanently lost!"
    );
    if (!confirmed) return;

    try {
      const token = await auth.currentUser.getIdToken();
      const res = await fetch("/api/update-profile", {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();

      if (res.ok) {
        alert("Account deleted successfully");
        await signOut(auth);
        router.push("/login");
      } else {
        alert("Error: " + data.error);
      }
    } catch (error) {
      console.error("Delete error:", error);
      alert("Unexpected error occurred");
    }
  };

  if (loading) return <p><Loading /></p>;

  return (
    <div style={{ padding: "20px", textAlign: "center" }} className="profileCard">
      <h1>My Profile</h1>

      {isEditing ? (
        <div style={{ maxWidth: "500px", margin: "0 auto", textAlign: "left" }}>
          <p className="profile-p">
            <strong>Full Name:</strong>
            <input
              type="text"
              name="displayName"
              value={formValues.displayName}
              onChange={handleInputChange}
              className="profileInput"
            />
          </p>
          <p className="profile-p">
            <strong>Email:</strong>
            <input
              type="email"
              name="email"
              value={formValues.email}
              onChange={handleInputChange}
              className="profileInput"
            />
          </p>
          <p className="profile-p">
            <strong>Phone:</strong>
            <input
              type="text"
              name="phoneNumber"
              value={formValues.phoneNumber}
              onChange={handleInputChange}
              className="profileInput"
            />
          </p>
          <p className="profile-p">
            <strong>Password:</strong>
            <input
              type="password"
              name="password"
              value={formValues.password}
              placeholder="New Password"
              onChange={handleInputChange}
              className="profileInput"
            />
          </p>
          <button onClick={handleSaveProfile} className="profileSaveButton">Save Changes</button>
          <button onClick={() => setIsEditing(false)} className="profileDeleteButton">Cancel</button>
        </div>
      ) : (
        <div style={{ maxWidth: "500px", margin: "0 auto", textAlign: "left" }}>
          <p className="profile-p" ><strong>Full Name:</strong> {userProfile.displayName}</p>
          <p className="profile-p" ><strong>Email:</strong> {userProfile.email}</p>
          <p className="profile-p" ><strong>Phone:</strong> {userProfile.phoneNumber}</p>
          <p className="profile-p" ><strong>Password:</strong> *****</p>
          <button onClick={() => setIsEditing(true)} className="profileSaveButton">Update Profile</button>
          <button onClick={handleDeleteAccount} className="profileDeleteButton">
            Delete Account
          </button>
        </div>
      )}
    </div>
  );
}