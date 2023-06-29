
import os, json, pdb

# Root
ROOT  = os.path.dirname(os.path.abspath(__file__))

def main():
	# Get All Directories
	with os.scandir(os.path.join(ROOT, "races_pics")) as f:
		folders = [a for a in f if not a.is_file() and a.name != ".DS_Store"]

	# JSON
	data = {}

	# Extract
	for directory in folders:
		with os.scandir(directory.path) as f:
			# print([a.name for a in f if a.name == ".DS_Store"])

			images = [a.name for a in f if a.is_file() and a.name != ".DS_Store"]

		data[directory.name] = images

	# Save JSON
	with open("data.json", 'w') as f:
		f.write(json.dumps(data))

	print("JSON file created.")

main()