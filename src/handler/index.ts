import { User } from "../generated-entities/User";


// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export const handleSubmit = async (eventData: any, chainId: number) => {
  try {
    const user = new User();
    user.name = eventData.name;
    user.username = eventData.username;
    console.log("handleSubmit");
    await user.save(chainId);
  } catch (err) {
    console.log(err);
  }
};
