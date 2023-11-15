import { useState, useEffect } from "react"
import Error from "../components/Error"
import { signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth"
import { auth } from "../firebase"
import { Link, useNavigate } from "react-router-dom"

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState(null)

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        const uid = user.uid
        navigate(`../${uid}`)
      } else {
        console.log("user logged out")
      }
    })
  }, [])

  const loginUser = (e) => {
    e.preventDefault()
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        const user = userCredential.user
        setError(() => null)
        navigate(`/${user.uid}`)
      })
      .catch((error) => {
        const errorCode = error.code
        const errorMessage = error.message
        console.log(errorCode, errorMessage)
        setError(() => "Wrong email or password, please try again")
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
        <Link to="signup" className="link">
          Sign-up here
        </Link>
      </p>
      <h2 className="subhead">Login</h2>
      <form className="form" onSubmit={loginUser}>
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
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {error && <Error errorMessage={error} />}
        <button className="btn btn-form" id="login-button">
          Submit
        </button>
      </form>
    </div>
  )
}
