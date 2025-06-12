-- Create function to get user metadata
create or replace function public.get_user_metadata(user_id_input uuid)
returns jsonb
language plpgsql
security definer
as $$
begin
  return (
    select raw_user_meta_data
    from auth.users
    where id = user_id_input
  );
end;
$$; 