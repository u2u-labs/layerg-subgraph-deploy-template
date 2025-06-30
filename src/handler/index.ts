import { Post } from "../generate-entity/Post";
import { User } from "../generate-entity/User";

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export const handleSubmit = async (eventData: any, chainId: number) => {
  try {
    const user = new User();
    user.name = eventData.name;
    console.log("handleSubmit");
    await user.save(chainId);
  } catch (err) {
    console.log(err);
  }
};

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export const handleNewPost = async (eventData: any, chainId: number) => {
  try {
    const post = new Post();
    post.title = eventData.title;
    post.content = eventData.content;
    console.log("handleNewPost");
    await post.save(chainId);
  } catch (err) {
    console.log(err);
  }
};
