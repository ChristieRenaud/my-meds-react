import React, { useState, useEffect } from "react"
import {
  setPersistence,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  browserSessionPersistence,
} from "firebase/auth"
import { auth } from "../firebase"
import { NavLink, useNavigate } from "react-router-dom"

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
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

  const onLogin = (e) => {
    e.preventDefault()

    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        const user = userCredential.user
        setError(() => null)
        navigate("/userId")
        console.log(user)
      })
      .catch((error) => {
        const errorCode = error.code
        const errorMessage = error.message
        console.log(errorCode, errorMessage)
        setError(() => "Wrong email or password, please try again.")
      })
  }
  return (
    <div>
      <h2 className="subhead">
        All your prescription information in one place
      </h2>
      <p className="text-block">
        No more searching through bottles and containers to get the information
        you need. Keep track of all your medications and dosages in one
        easy-to-use app. No account?{" "}
        <NavLink to="signup" className="link">
          Sign-up here
        </NavLink>
      </p>
      <h2 className="subhead">Login</h2>
      <form className="form">
        <label className="label" htmlFor="email">
          Email
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
        {error && <p className="error-message">{error}</p>}
        <button className="btn btn-form" id="login-button" onClick={onLogin}>
          Submit
        </button>
      </form>
    </div>
  )
}
