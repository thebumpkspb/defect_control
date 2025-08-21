
# Build the Docker image
docker compose build

# Save the Docker image to a tar file
docker save -o nextjs-image.tar frontend-nextjs

# Copy the tar file to the remote server
scp nextjs-image.tar administrator@89.213.177.23:/home/administrator/p-chart-nextjs

# Load the image on the remote server
ssh administrator@89.213.177.23 "cd /home/administrator/p-chart-nextjs; docker load < nextjs-image.tar"

# Stop and remove the existing container if it exists
ssh administrator@89.213.177.23 "docker stop p-chart-nextjs-nextjs -t 5; docker rm p-chart-nextjs-nextjs"

# Run the new container
ssh administrator@89.213.177.23 "docker run -d -p 8087:3000 --name p-chart-nextjs-nextjs frontend-nextjs"