import { useState } from "react";
import axios from "axios";

export default function Form() {
  const [firstname, setFirst] = useState("");
  const [lastname, setLast] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [image, setImage] = useState("");

  async function submitHandler(e) {
    console.log(firstname, lastname, email, password, phone, image);

    try {
      const response = await axios.post();
    } catch (err) {
      console.error(err);
    }
  }

  function handleImageLoad(e) {
    console.log(e.target.files);
  }

  return (
    <>
      <form action="post">
        <label htmlFor="firstName">
          Firstname
          <input
            type="text"
            name="firstName"
            id="firstName"
            placeholder="jon"
            onChange={(e) => setFirst(e.target.value)}
            value={firstname}
          />
        </label>
        <label htmlFor="lastName">
          Lastname
          <input
            type="text"
            name="lastName"
            id="lastName"
            placeholder="doe"
            onChange={(e) => setLast(e.target.value)}
            value={lastname}
          />
        </label>
        <label htmlFor="email">
          Email
          <input
            type="email"
            name="email"
            id="email"
            placeholder="jonh@home"
            onChange={(e) => setEmail(e.target.value)}
            value={email}
          />
        </label>
        <label htmlFor="password">
          Password
          <input
            type="password"
            name="password"
            id="password"
            onChange={(e) => setPassword(e.target.value)}
            value={password}
          />
        </label>
        <label htmlFor="phone">
          Phone
          <input
            type="text"
            name="phone"
            id="phone"
            onChange={(e) => setPhone(e.target.value)}
            value={phone}
          />
        </label>
        <label htmlFor="avatar">
          Avatar Image
          <input
            type="file"
            name="avatar"
            id="avatar"
            value={image}
            onInput={(e) => setImage(e.target.value)}
          />
          {image && <img src={image} alt="" />}
        </label>
        <button type="button">submit</button>
      </form>
      <button type="button" onClick={(e) => submitHandler(e)}>
        log
      </button>
    </>
  );
}
