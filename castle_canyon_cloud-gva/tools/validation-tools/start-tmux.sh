#!/bin/bash

SCRIPT_SESSION_NAME="ValidationTmux";

FINDSESSION=$(tmux list-sessions -F "#S" | grep "$SCRIPT_SESSION_NAME");

echo "FINDSESSION is : $FINDSESSION"

if [ "$FINDSESSION" == "$SCRIPT_SESSION_NAME" ]; then
	echo "session already exists, reattaching"
	tmux attach-session -t "$SCRIPT_SESSION_NAME";
else
	echo "tmux session not found, creating a new one"
	tmux new-session -d -s "$SCRIPT_SESSION_NAME"
	tmux split-window -h -t "$SCRIPT_SESSION_NAME"
	tmux send-keys -t "$SCRIPT_SESSION_NAME:0.1" 'cd ~/validation-tools' Enter
	tmux send-keys -t "$SCRIPT_SESSION_NAME:0.1" 'clear' Enter
	tmux send-keys -t "$SCRIPT_SESSION_NAME:0.1" './view-gva-help.sh' Enter
	tmux attach-session -t "$SCRIPT_SESSION_NAME:0.0"
fi
