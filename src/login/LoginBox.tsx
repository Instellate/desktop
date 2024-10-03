import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import { useRef } from 'react';

export function LoginBox({ setState }: { setState: (val: boolean) => void }) {
  const navigate = useNavigate();
  const emailInput = useRef<HTMLInputElement>(null);
  const passwordInput = useRef<HTMLInputElement>(null);

  async function login() {
    const email = emailInput.current?.value;
    const password = passwordInput.current?.value;

    const request = await fetch(import.meta.env.API_URL + '/api/account/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
      }),
    });
    const { token }: { token: string } = await request.json();
    localStorage.setItem('token', token);
    navigate('/');
  }

  return (
    <>
      <div className="h-fit w-fit rounded-md bg-[#2c3845] shadow-lg">
        <div className="m-12 flex w-fit flex-col gap-4">
          <div>
            <h3 className="text-2xl">Welcome back!</h3>
            <span className="text-xs">Shattered</span>
          </div>
          <input
            type="text"
            placeholder="Email"
            className="rounded-md bg-[#5c6b78] p-2 placeholder-gray-300"
            ref={emailInput}
          />
          <input
            type="password"
            placeholder="Password"
            className="rounded-md bg-[#5c6b78] p-2 placeholder-gray-300"
            ref={passwordInput}
          />
          <Button onClick={login}>Login</Button>
          <span className="text-xs">
            Don't have an account yet? Press{' '}
            <button className="text-blue-400" onClick={() => setState(true)}>
              here
            </button>{' '}
            to make one!
          </span>
        </div>
      </div>
    </>
  );
}
