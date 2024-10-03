import { useState } from 'react';
import { LoginBox } from './LoginBox';
import RegisteringBox from './RegisterBox';

export default function Login() {
  const [isRegistering, setIsRegistering] = useState(false);
  let box;
  if (!isRegistering) {
    box = <LoginBox setState={setIsRegistering} />;
  } else {
    box = <RegisteringBox setState={setIsRegistering} />;
  }

  return (
    <>
      <div className="flex h-full w-full items-center justify-center bg-gradient-to-bl from-[#404066] to-[#1E3A4C]">
        {box}
      </div>
    </>
  );
}
