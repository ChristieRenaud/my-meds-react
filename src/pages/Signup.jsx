import { useState, useEffect } from "react"
import { NavLink, useNavigate } from "react-router-dom"
import Error from "../components/Error"
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  updateProfile,
} from "firebase/auth"
import { auth, database } from "../firebase"
import { ref, set } from "firebase/database"

export default function Signup() {
  const navigate = useNavigate()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [error, setError] = useState(null)

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        const uid = user.uid
        navigate(`/${uid}`)
      } else {
        console.log("user logged out")
      }
    })
  }, [])

  function createUserDatabase(id) {
    set(ref(database, "users/" + id), {
      userId: id,
    })
  }

  function updateUserAccount() {
    updateProfile(auth.currentUser, {
      displayName: firstName,
    })
      .then(() => {
        console.log("Profile updated!")
      })
      .catch((error) => {
        console.log(error.message)
      })
  }
  const onSubmit = async (e) => {
    e.preventDefault()

    await createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        const user = userCredential.user
        const userId = user.uid
        setError(() => null)
        createUserDatabase(userId)
        updateUserAccount()
        navigate("/")
      })
      .catch((error) => {
        console.log(error.code, error.message)
        email === "" && password === ""
          ? setError("Email and password missing.")
          : email === ""
          ? setError("Email missing.")
          : setError("Password missing.")
        if (error.code === "auth/email-already-in-use") {
          setError(
            "Account already exists. Log in or create account with new email address."
          )
        }
      })
  }

  return (
    <div>
      <h2 className="subhead">Account Sign Up</h2>
      <form className="form">
        <label className="label" htmlFor="first-name">
          First Name
        </label>
        <input
          className=""
          id="first-name"
          type="text"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          required
        />
        <label className="label" htmlFor="last-name">
          Last Name
        </label>
        <input
          className=""
          id="last-name"
          type="text"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          required
        />
        <label className="label" htmlFor="email">
          Email Address
        </label>
        <input
          className=""
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <label className="label" htmlFor="password">
          Password
        </label>
        <input
          className=""
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {error && <Error errorMessage={error} />}
        <button
          className="btn btn-form"
          id="signup-button"
          type="submit"
          onClick={onSubmit}
        >
          Submit
        </button>
      </form>

      <p>
        Already have an account?{" "}
        <NavLink to="/" className="link">
          Log in
        </NavLink>{" "}
      </p>
    </div>
  )
}
