import React from "react";
import "../styles/App.css";
import loader from "../assets/creative_loader.gif";

export default function Loading({ isLoading }) {
  return (
    <>
      {isLoading && (
        <div className="overlay">
          <span>
            <img src={loader} alt="Loading..." className="loader-image"  />
          </span>
        </div>
      )}
    </>
  );
}