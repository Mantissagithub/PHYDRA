import subprocess

# Provide input to a process
process = subprocess.Popen(['grep', 'hello'], stdin=subprocess.PIPE, stdout=subprocess.PIPE, text=True)
stdout, stderr = process.communicate(input='hello world\nhello python')

print(stdout)
