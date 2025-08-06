import { useState } from "react";
import { FiArrowRight, FiArrowLeft } from "react-icons/fi";
import CircleForm from "./CircleForm";

const NewCirclePage = ({ onClose }) => {
  const [step, setStep] = useState(1); // 1 = intro, 2 = form

  if (step === 2) {
    return <CircleForm onBack={() => setStep(1)} onClose={onClose} />;
  }

  return (
    <div className="h-full p-8 text-gray-200 flex flex-col justify-center items-center text-center">
      <h2 className="text-2xl font-bold mb-4">Create a New Circle</h2>
      <p className="text-sm max-w-md mb-6">
        Circles help you group like-minded individuals in your sector.
        Use this feature to manage teams, projects, or special interests easily.
      </p>
      <p className="text-sm max-w-md mb-10">
        You can invite friends, start discussions, and stay organized — all in one place.
      </p>
      
      <button
        onClick={() => setStep(2)}
        className="bg-blue-600 hover:bg-blue-500 p-4 rounded-full text-white text-xl shadow-lg"
        title="Start Creating"
      >
        <FiArrowRight />
      </button>

      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-gray-400 hover:text-white"
        title="Close"
      >
        ✕
      </button>
    </div>
  );
};

export default NewCirclePage;
