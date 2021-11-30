// Some comment

@documentclass(article) // Another comment

import amsmath

@title(Simple Sample)
@author(My Name)
@date(@today)

// A different comment
document:
    @maketitle

    @section(Hello World!)

    @textbf(Hello World!) Today I am learning @LaTeX.
    @LaTeX is a great program for writing math.
    I can write in line math such as $a^2+b^2=c^2$ %$ tells LaTexX to compile as math.
    I can also give equations their own space:
    equation:
        @gamma^2+@theta^2=@omega^2
    If I do not leave any blank lines @LaTeX will continue this text without making it into a new paragraph.  Notice how there was no indentation in the text after equation (1).
    Also notice how even though I hit enter after that sentence and here $@downarrow$
    @LaTeX formats the sentence without any break.  Also   look  how      it   doesn't     matter          how    many  spaces     I put     between       my    words.

    For a new paragraph I can leave a blank space in my code.