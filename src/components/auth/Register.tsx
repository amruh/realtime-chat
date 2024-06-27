import { Dispatch, SetStateAction, useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { PersonIcon } from "@radix-ui/react-icons";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../../lib/firebase";
import { doc, setDoc } from "firebase/firestore";
import { toast } from "sonner";
import { upload } from "../../lib/upload";
import { cn } from "../../lib/utils";

export default function Register({
  setAuth,
}: {
  setAuth: Dispatch<SetStateAction<boolean>>;
}) {
  const [avatar, setAvatar] = useState<{ file: File | null; url: string }>({
    file: null,
    url: "",
  });
  const [loading, setLoading] = useState(false);

  const handleAvatar = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAvatar({
        file: e.target.files[0],
        url: URL.createObjectURL(e.target.files[0]),
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const username = formData.get("username") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      const res = await createUserWithEmailAndPassword(auth, email, password);

      let imgUrl = null;
      if (avatar.file) {
        imgUrl = await upload(avatar.file);
      }

      await setDoc(doc(db, "users", res.user.uid), {
        username,
        email: res.user.email,
        id: res.user.uid,
        avatar: imgUrl,
        blocked: [],
      });

      await setDoc(doc(db, "userChats", res.user.uid), {
        chats: [],
      });

      toast.success("Account create succefully!");
      setAuth(true);
    } catch (error: any) {
      console.log(error);
      throw new Error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col flex-[2] items-center justify-center p-4">
      <h1 className="text-2xl font-bold mb-2">Register</h1>
      <form className="space-y-3" onSubmit={handleSubmit}>
        <div>
          <Label htmlFor="username">Username</Label>
          <Input id="username" name="username" disabled={loading} />
        </div>
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
        <div className="flex justify-between items-center ">
          <div className="size-8 rounded-full bg-gray-500 flex items-center justify-center overflow-hidden">
            {avatar.url ? (
              <img
                src={avatar.url}
                alt="avatar"
                className="object-cover h-full w-full"
              />
            ) : (
              <PersonIcon className="size-3 text-white" />
            )}
          </div>
          <Label
            htmlFor="file"
            className={cn("cursor-pointer", {
              "cursor-not-allowed": loading,
            })}
          >
            Upload avatar
          </Label>
          <Input
            id="file"
            type="file"
            className="hidden"
            disabled={loading}
            onChange={(e) => handleAvatar(e)}
          />
        </div>
        <Button
          type="submit"
          className="w-full"
          variant="chatTheme"
          disabled={loading}
        >
          Sign Up
        </Button>
      </form>
      <div>
        {" "}
        Have an account?{" "}
        <Button
          onClick={() => setAuth((prev) => !prev)}
          variant="link"
          className="p-0"
          disabled={loading}
        >
          Sign Up
        </Button>
      </div>
    </div>
  );
}
