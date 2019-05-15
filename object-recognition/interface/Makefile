EXECUTABLE = interface
TAR_NAME = interface.tar.gz

FILES = interface.cpp
TAR_FILES = $(FILES) makefile

main: $(FILES:.cpp=.o)
	#@rm -f *.o
	@rm -f $(EXECUTABLE)
	g++ -g -Wall $(FILES) -o $(EXECUTABLE)
	@echo "Done."

run:
	@./$(EXECUTABLE)

rum:
	@./$(EXECUTABLE)

clean:	
	@rm -f *.o
	@rm -f $(EXECUTABLE)
	@echo "Done, squeaky clean !"

tar:
	@echo "Compressing :"	
	tar -cvz $(TAR_FILES) -f $(TAR_NAME)
	@echo "Done."

zip:
	@echo "Compressing :"	
	zip $(TAR_NAME) $(TAR_FILES)
	@echo "Done."
