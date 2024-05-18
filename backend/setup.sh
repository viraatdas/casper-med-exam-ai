#!/bin/bash

# Navigate to the src directory
cd src

# Install dependencies
pip install -r ../requirements.txt

# Run migrations if necessary
# Uncomment and adjust the following line if you have migrations
# python manage.py migrate

# Collect static files if necessary
# Uncomment and adjust the following line if you have static files
# python manage.py collectstatic --noinput

# Start the application
# Adjust the following line to match the command used to start your backend
# For Flask, it might be something like: gunicorn --bind 0.0.0.0:$PORT wsgi:app
python app.py

