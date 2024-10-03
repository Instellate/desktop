import Button from '../components/Button';

type Props = {
  setState: (val: boolean) => void;
};

export default function RegisteringBox({ setState }: Props) {
  return (
    <>
      <div className="h-fit w-fit rounded-md bg-[#2c3845] shadow-lg">
        <div className="m-12 flex w-fit flex-col gap-4">
          <div>
            <h3 className="text-2xl">Welcome!</h3>
            <span className="text-xs">Shattered</span>
          </div>
          <input
            type="text"
            placeholder="Username"
            className="rounded-md bg-[#5c6b78] p-2 placeholder-gray-300"
          />
          <input
            type="text"
            placeholder="Display name"
            className="rounded-md bg-[#5c6b78] p-2 placeholder-gray-300"
          />
          <input
            type="text"
            placeholder="Email"
            className="rounded-md bg-[#5c6b78] p-2 placeholder-gray-300"
          />
          <input
            type="text"
            placeholder="Password"
            className="rounded-md bg-[#5c6b78] p-2 placeholder-gray-300"
          />
          <Button>Register</Button>
          <span className="text-xs">
            Already have an account? Press{' '}
            <button className="text-blue-400" onClick={() => setState(false)}>
              here
            </button>{' '}
            to login!
          </span>
        </div>
      </div>
    </>
  );
}
