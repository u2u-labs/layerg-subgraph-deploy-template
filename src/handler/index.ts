export const handleNewUser = async (eventData: {
  id: string;
  name: string;
  username: string;
}) => {
  const newUser = new User();
  newUser.id = eventData.id;
  newUser.name = eventData.name;
  newUser.username = eventData.username;
  await newUser.save();
};