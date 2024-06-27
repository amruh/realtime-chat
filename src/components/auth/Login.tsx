import { Dispatch, SetStateAction, useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../lib/firebase";
import { FirebaseError } from "firebase/app";
import { toast } from "sonner";

export default function Login({
  setAuth,
}: {
  setAuth: Dispatch<SetStateAction<boolean>>;
}) {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: unknown) {
      console.log(error);
      if (error instanceof FirebaseError) {
        toast.error(error.message);
      } else {
        toast.error("Something went wrong");
      }
      return;
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col flex-[2] items-center justify-center p-4">
      <h1 className="text-2xl font-bold mb-2">Login</h1>
      <form className="space-y-2" onSubmit={handleSubmit}>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" name="email" disabled={loading} />
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            name="password"
            disabled={loading}
          />
        </div>
        <Button
          type="submit"
          variant="chatTheme"
          className="w-full"
          disabled={loading}
        >
          Login
        </Button>
      </form>
      <div>
        <Button
          onClick={() => setAuth((prev) => !prev)}
          variant="link"
          className="p-0"
          disabled={loading}
        >
          Sign up
        </Button>{" "}
        instead?
      </div>
    </div>
  );
}
